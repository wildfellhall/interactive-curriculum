import sys, json, io, types, contextlib, math, os, tempfile, itertools, ast, inspect

class _Output(io.StringIO):
    def write(self, value):
        if self.tell() + len(value) > 6000:
            raise RuntimeError('This program printed too much. Try fewer repeats.')
        return super().write(value)

def _simple(value, depth=0):
    if value is None or type(value) in (bool, int, float, str):
        if isinstance(value, str): return value[:180]
        if type(value) is float and not math.isfinite(value): return str(value)
        if isinstance(value, int) and value.bit_length() > 500: return 'very large number'
        return value
    if depth > 2: return '…'
    if isinstance(value, (list, tuple)):
        return [_simple(v, depth + 1) for v in value[:16]]
    if isinstance(value, dict):
        return {str(k)[:40]: _simple(v, depth + 1) for k,v in list(value.items())[:12]}
    if isinstance(value, types.ModuleType): return 'module ' + value.__name__
    if isinstance(value, (set, frozenset)):
        return [_simple(v, depth + 1) for v in sorted(itertools.islice(value, 16), key=repr)]
    if isinstance(value, type): return 'class ' + value.__name__
    if isinstance(value, types.FunctionType): return 'function ' + value.__name__
    if hasattr(value, '__dict__'):
        attributes = _simple(vars(value), depth + 1)
        return {'object': type(value).__name__, **(attributes if isinstance(attributes, dict) else {'attributes': attributes})}
    return type(value).__name__

def _variables(namespace):
    return [{'name': name, 'type': type(value).__name__, 'value': _simple(value)}
            for name, value in list(namespace.items())[:80]
            if not name.startswith('_') and name != 'input'][:18]

def _counter_check(Counter):
    first, second = Counter(), Counter()
    first.add()
    first.add()
    return first.value == 2 and second.value == 0

def _raises(expected, function):
    try:
        function()
    except expected:
        return True
    except BaseException:
        return False
    return False

def _write_text(path, text):
    with open(path, 'w', encoding='utf-8') as file:
        file.write(text)
    return True

def _test_rejects(test, name, replacement):
    namespace = test.__globals__
    original = namespace.get(name)
    namespace[name] = replacement
    try:
        test()
    except AssertionError:
        return True
    except BaseException:
        return False
    finally:
        namespace[name] = original
    return False

def _collect_files():
    files, omitted = [], 0
    for directory, folders, names in os.walk('.'):
        folders[:] = [name for name in folders if not os.path.islink(os.path.join(directory, name))]
        for name in sorted(names):
            path = os.path.join(directory, name)
            if os.path.islink(path):
                continue
            try:
                if len(files) >= 12 or os.path.getsize(path) > 20000:
                    omitted += 1
                    continue
                with open(path, encoding='utf-8') as file:
                    text = file.read()
                files.append({'name': os.path.relpath(path, '.'), 'text': text})
            except (OSError, UnicodeError):
                omitted += 1
    return {'files': files, 'filesOmitted': omitted}

async def _run_student_json(raw):
    previous = os.getcwd()
    with tempfile.TemporaryDirectory(prefix='python-course-') as workspace:
        try:
            os.chdir(workspace)
            return await _run_in_workspace(raw)
        finally:
            os.chdir(previous)

async def _run_in_workspace(raw):
    request = json.loads(raw)
    code = request['code']
    inputs = request.get('input', '').splitlines()
    cursor = 0
    output = _Output()
    namespace = {'__name__': '__main__'}
    frames = []
    events = 0
    error = None

    def read_input(prompt=''):
        nonlocal cursor
        if request.get('interactive'):
            answer = str(_browser_input(str(prompt), output.getvalue()))
            output.write(str(prompt) + answer + '\n')
            return answer
        if prompt: output.write(str(prompt))
        if cursor >= len(inputs):
            raise EOFError('Add an answer in the Input box. Use one line for each input().')
        answer = inputs[cursor]
        cursor += 1
        return answer

    namespace['input'] = read_input
    def trace(frame, event, arg):
        nonlocal events
        if frame.f_code.co_filename != '<student>': return trace
        if event == 'line':
            events += 1
            if events > 2000:
                raise RuntimeError('This program repeated too many steps. Check the loop or try a smaller number.')
            if len(frames) < 200:
                frames.append({'line': frame.f_lineno, 'scope': 'main program' if frame.f_code.co_name == '<module>' else frame.f_code.co_name,
                               'variables': _variables(frame.f_locals), 'output': output.getvalue()})
        return trace

    try:
        for attached in request.get('files', [])[:6]:
            name, text = attached['name'], attached['text']
            if name != os.path.basename(name) or name in ('', '.', '..') or len(text.encode('utf-8')) > 20000:
                raise ValueError('Use a plain file name and at most 20 KB of text.')
            _write_text(name, text)
        compiled = compile(code, '<student>', 'exec', flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            sys.settrace(trace)
            running = eval(compiled, namespace)
            if inspect.isawaitable(running):
                await running
    except BaseException as exc:
        line = getattr(exc, 'lineno', None)
        tb = exc.__traceback__
        while tb:
            if tb.tb_frame.f_code.co_filename == '<student>': line = tb.tb_lineno
            tb = tb.tb_next
        error = {'type': type(exc).__name__, 'message': str(exc)[:320], 'line': line}
    finally:
        sys.settrace(None)
    final = {'line': None, 'scope': 'main program', 'variables': _variables(namespace), 'output': output.getvalue(), 'finished': True}
    frames.append(final)
    artifacts = _collect_files()
    results = []
    if not error:
        for check in request.get('checks', []):
            try:
                with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                    passed = bool(eval(check['test'], {**namespace, '_output': output.getvalue(), '_inputs': inputs, '_counter_check': _counter_check, '_raises': _raises, '_write_text': _write_text, '_test_rejects': _test_rejects}))
            except BaseException:
                passed = False
            results.append({'label': check['label'], 'passed': passed})
    return json.dumps({'output':output.getvalue(), 'variables': final['variables'], 'frames':frames, 'truncated':events > 200,
                       'error':error, 'checks':results, **artifacts}, ensure_ascii=False, allow_nan=False)
