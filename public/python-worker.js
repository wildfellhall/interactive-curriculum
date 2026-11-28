import {loadPyodide} from './pyodide/pyodide.mjs';
let inputBuffer;
function browserInput(prompt, output){
 if(!inputBuffer)throw new Error('Live input is unavailable. Use prepared answers.');
 const header=new Int32Array(inputBuffer,0,2);
 Atomics.store(header,0,0);
 self.postMessage({type:'input',prompt,output});
 Atomics.wait(header,0,0);
 const length=Atomics.load(header,1);
 const answer=new TextDecoder().decode(new Uint8Array(inputBuffer,8,length).slice());
 self.postMessage({type:'running'});
 return answer;
}
const ready=loadPyodide({indexURL:new URL('./pyodide/',import.meta.url).href}).then(async python=>{
 const response=await fetch(new URL('./runner.py',import.meta.url));
 if(!response.ok)throw new Error('The Python helper could not be loaded.');
 python.runPython(await response.text());
 python.globals.set('_browser_input',browserInput);
 return python;
});
self.onmessage=async({data})=>{
 try{
  const python=await ready;
  const {inputBuffer:buffer,...request}=data;inputBuffer=buffer;
  self.postMessage({type:'running'});
  python.globals.set('_student_request',JSON.stringify(request));
  const result=JSON.parse(await python.runPythonAsync('await _run_student_json(_student_request)'));
  python.globals.delete('_student_request');
  self.postMessage({type:'result',result});
 }catch(error){self.postMessage({type:'failure',message:'Python could not finish this run. Stop and try again.',detail:String(error)});}
};
