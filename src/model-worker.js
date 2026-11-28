import {trainStep,measure,trainingPairs} from './model-math.js';
let stopped=false,busy=false;
self.onmessage=async({data})=>{
 if(data.type==='stop'){stopped=true;return}
 if(data.type!=='train'||busy)return;
 busy=true;stopped=false;
 try{
  const model=data.model,steps=Number(data.steps);
  if(!Number.isInteger(steps)||steps<1||steps>100000)throw new Error('Choose 1–100,000 additional steps per run. You can continue with another run afterward.');
  const end=model.step+steps;if(!Number.isSafeInteger(end))throw new Error('This step count is too large to record accurately.');
  const prepared=trainingPairs(model),reportEvery=Math.max(5,Math.ceil(steps/100));let reported=model.step;
  while(model.step<end&&!stopped){
   const start=performance.now();let count=0;
   do{trainStep(model,prepared);count++}while(model.step<end&&count<(steps<=50?5:25)&&performance.now()-start<12);
   if(model.step-reported>=reportEvery||model.step===end){measure(model);self.postMessage({type:'snapshot',model});reported=model.step}
   await new Promise(resolve=>setTimeout(resolve,steps<=50?15:0));
  }
  measure(model);self.postMessage({type:'done',model});
 }catch(error){self.postMessage({type:'error',message:error.message})}finally{busy=false}
};
