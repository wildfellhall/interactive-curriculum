import {useEffect,useRef,useState} from 'react';
export function usePython(){
 const worker=useRef(null),timer=useRef(null),callback=useRef(null),shared=useRef(null),limit=useRef(5000);
 const [status,setStatus]=useState('idle'),[result,setResult]=useState(null),[message,setMessage]=useState(''),[prompt,setPrompt]=useState(null),[liveOutput,setLiveOutput]=useState('');
 const liveAvailable=typeof SharedArrayBuffer!=='undefined'&&globalThis.crossOriginIsolated;
 function dispose(){clearTimeout(timer.current);worker.current?.terminate();worker.current=null;callback.current=null;shared.current=null;}
 useEffect(()=>()=>dispose(),[]);
 function stop(text='Run stopped. You can change the code and try again.'){dispose();setStatus('idle');setPrompt(null);setMessage(text);}
 function clear(){if(worker.current&&callback.current)dispose();setStatus('idle');setResult(null);setPrompt(null);setLiveOutput('');setMessage('');}
 function deadline(){clearTimeout(timer.current);timer.current=setTimeout(()=>stop('This run took too long. Check the loop or try the request again.'),limit.current);}
 function answer(text){
  if(!shared.current||status!=='waiting')return;
  const bytes=new TextEncoder().encode(text.slice(0,1000)),header=new Int32Array(shared.current,0,2);
  new Uint8Array(shared.current,8).set(bytes);Atomics.store(header,1,bytes.length);
  setPrompt(null);setStatus('running');deadline();Atomics.store(header,0,1);Atomics.notify(header,0);
 }
 function run(code,input,checks,onResult,options={}){
  if(callback.current)return;
  const interactive=!!options.interactive&&liveAvailable;
  shared.current=interactive?new SharedArrayBuffer(4104):null;
  limit.current=options.network?30000:5000;
  setResult(null);setMessage('');setPrompt(null);setLiveOutput('');setStatus(worker.current?'running':'loading');callback.current=onResult;
  if(!worker.current){
   worker.current=new Worker('/python-worker.js',{type:'module'});
   worker.current.onerror=()=>stop('Python could not load. Reload the page and try again.');
   worker.current.onmessage=({data})=>{
    if(data.type==='running'){setStatus('running');deadline();}
    if(data.type==='input'){clearTimeout(timer.current);setLiveOutput(data.output);setPrompt(data.prompt);setStatus('waiting');}
    if(data.type==='result'){clearTimeout(timer.current);setResult(data.result);setStatus('idle');setPrompt(null);const done=callback.current;callback.current=null;done?.(data.result);}
    if(data.type==='failure')stop(data.message);
   };
  }
  clearTimeout(timer.current);timer.current=setTimeout(()=>stop('Python is taking too long to load. Try running the code again.'),45000);
  worker.current.postMessage({code,input,checks,interactive,files:options.files||[],inputBuffer:shared.current});
 }
 return {run,answer,stop,clear,result,status,message,prompt,liveOutput,liveAvailable,busy:status!=='idle'};
}
export function errorHelp(error){
 const help={SyntaxError:'Check the quotes, brackets, and colons on this line.',IndentationError:'Use four spaces at the start of each line inside a block.',TabError:'Use spaces for indentation. Do not mix spaces and tabs.',NameError:'Check the spelling. Give this name a value before you use it.',TypeError:'Check the value types. Text and numbers may need different operations.',ValueError:'This value is not allowed here. Read the message below and check the function’s input rules.',IndexError:'This position is not in the list. The first index is 0.',KeyError:'This key is not in the dictionary. Check its spelling.',AttributeError:'This object does not have that attribute or method. Check the name.',ZeroDivisionError:'A number cannot be divided by zero.',EOFError:'Add an answer in Input. Use one line for each input() call.',FileNotFoundError:'Check the file name. Each run starts in a fresh practice folder, so create the required file earlier in this run.',AssertionError:'A check failed. Compare the expected value in the assertion with the result your code produced.',StopIteration:'This iterator has no more values. Create a new iterator, or use a loop that stops when the values end.',JSONDecodeError:'Check the JSON text. Keys and text values need double quotes, and items need commas between them.'};
 return help[error.type]||'Read the message below, then change the code and try again.';
}
