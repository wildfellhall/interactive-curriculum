// Real, deliberately small calculations used by the language-model course.
export function randomSource(seed=42){let state=seed>>>0;return()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296}}
export function probabilities(scores,temperature=1,topK=0){
 if(!scores.length||temperature<=0)throw new Error('Use a positive temperature and at least one score.');
 const keep=topK>0?new Set(scores.map((_,i)=>i).sort((a,b)=>scores[b]-scores[a]||a-b).slice(0,Math.min(topK,scores.length))):null;
 const max=Math.max(...scores),values=scores.map((v,i)=>!keep||keep.has(i)?Math.exp((v-max)/temperature):0),sum=values.reduce((a,b)=>a+b,0);
 return values.map(v=>v/sum);
}
export function tokenize(text,mode='character'){
 const tokens=mode==='character'?Array.from(text):text.match(/\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu)||[];
 const vocabulary=[...new Set(tokens)],ids=tokens.map(t=>vocabulary.indexOf(t));return {tokens,vocabulary,ids};
}
export const showToken=t=>t===' '?'space':t==='\n'?'new line':t==='\t'?'tab':/^\s+$/.test(t)?JSON.stringify(t):t;
export function nextCounts(text,last){const tokens=Array.from(text),counts={};for(let i=0;i<tokens.length-1;i++)if(tokens[i]===last)counts[tokens[i+1]]=(counts[tokens[i+1]]||0)+1;return Object.entries(counts).sort((a,b)=>b[1]-a[1]);}
export function attention(query,keys,values,position){
 const scores=keys.map(k=>k.reduce((sum,v,i)=>sum+v*query[i],0)/Math.sqrt(query.length));
 const allowed=probabilities(scores.slice(0,position+1));const weights=keys.map((_,i)=>allowed[i]||0);
 return {scores,weights,output:values[0].map((_,d)=>values.reduce((sum,v,i)=>sum+weights[i]*v[d],0))};
}
export const TRAINING_TEXT=('abc abc abc abc abc abc abc abc\n').repeat(12);
export function composeVectors(input,order='ab',relu=false){
 const matrices={a:[[1,1],[0,1]],b:[[1,0],[-1,1]]};
 const multiply=(matrix,vector)=>matrix.map(row=>row.reduce((sum,v,i)=>sum+v*vector[i],0));
 const first=multiply(matrices[order[0]],input),middle=relu?first.map(v=>Math.max(0,v)):first;
 return {first,middle,output:multiply(matrices[order[1]],middle)};
}
export function makeModel(text,rate=1,seed=42){
 const chars=Array.from(text),vocab=[...new Set(chars)].sort();
 if(chars.length<80||chars.length>6000)throw new Error('Use 80–6,000 characters of training text.');
 if(vocab.length<2||vocab.length>64)throw new Error('Use 2–64 different characters.');
 const split=Math.floor(chars.length*.8),ids=chars.map(c=>vocab.indexOf(c)),random=randomSource(seed);
 const model={version:1,vocab,weights:Array.from({length:vocab.length*vocab.length},()=> (random()-.5)*.04),train:ids.slice(0,split),validation:ids.slice(split),step:0,rate,history:[]};
 measure(model);return model;
}
export function rowProbabilities(model,id,temperature=1,topK=0){const size=model.vocab.length;return probabilities(model.weights.slice(id*size,(id+1)*size),temperature,topK)}
export function loss(model,ids){if(ids.length<2)return null;const rows=model.vocab.map((_,i)=>rowProbabilities(model,i));let total=0;for(let i=0;i<ids.length-1;i++)total-=Math.log(Math.max(1e-30,rows[ids[i]][ids[i+1]]));return total/(ids.length-1)}
export function measure(model){const point={step:model.step,train:loss(model,model.train),validation:loss(model,model.validation)};if(model.history.at(-1)?.step===model.step)model.history[model.history.length-1]=point;else model.history.push(point);if(model.history.length>101){let remove=1,gap=Infinity;for(let i=1;i<model.history.length-1;i++){const span=model.history[i+1].step-model.history[i-1].step;if(span<gap){gap=span;remove=i}}model.history.splice(remove,1)}return point}
export function trainingPairs(model){
 const n=model.vocab.length,counts=new Float64Array(n*n),totals=new Float64Array(n),pairs=model.train.length-1;
 for(let i=0;i<pairs;i++){const a=model.train[i],b=model.train[i+1];counts[a*n+b]++;totals[a]++}
 return {counts,totals,pairs};
}
export function trainStep(model,prepared=trainingPairs(model)){
 const n=model.vocab.length,{counts,totals,pairs}=prepared;
 for(let a=0;a<n;a++){const p=rowProbabilities(model,a);for(let b=0;b<n;b++)model.weights[a*n+b]-=model.rate*(totals[a]*p[b]-counts[a*n+b])/pairs}
 model.step++;return model;
}
export function generate(model,prompt='',temperature=.8,topK=0,length=100,seed=42){
 const chars=Array.from(prompt);if(chars.some(c=>!model.vocab.includes(c)))throw new Error('Use starting characters that are in this model’s vocabulary.');
 const random=randomSource(seed),output=chars.length?[...chars]:[model.vocab[model.train[0]]];
 for(let s=0;s<length;s++){const p=rowProbabilities(model,model.vocab.indexOf(output.at(-1)),temperature,topK);let draw=random(),index=p.length-1;for(let i=0;i<p.length;i++){draw-=p[i];if(draw<=0){index=i;break}}output.push(model.vocab[index])}return output.join('');
}
export function evaluateText(model,text){const chars=Array.from(text),unknown=[...new Set(chars.filter(c=>!model.vocab.includes(c)))];if(unknown.length)throw new Error('This model has not learned these characters: '+unknown.map(showToken).join(', '));if(chars.length<2)throw new Error('Enter at least two characters.');return loss(model,chars.map(c=>model.vocab.indexOf(c)))}
