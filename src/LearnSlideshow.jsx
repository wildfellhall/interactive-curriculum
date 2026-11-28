import {DepthExperiment} from './CourseDepth.jsx';
import {getDepth} from './course-catalog.js';
import React,{useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,CheckCircle2} from 'lucide-react';
import Workbench from './Workbench.jsx';
import Visual from './Visuals.jsx';
import {slideTypes as allSlideTypes} from './lesson-slides.js';
import {getSlides,getProject} from './course-catalog.js';

function Anatomy({parts}){
 const [selected,setSelected]=useState(0);
 return <section className="syntax-explorer" aria-label="Parts of an instruction"><p className="caption">Select a part of the instruction.</p><div className="syntax-parts">{parts.map(([text,label],i)=><button key={i} aria-label={`${label}: ${text}`} aria-pressed={selected===i} onClick={()=>setSelected(i)}><code>{text}</code></button>)}</div><div className="syntax-explanation" aria-live="polite"><h3>{parts[selected][1]}</h3><p>{parts[selected][2]}</p></div></section>
}
function Walkthrough({lines}){
 const [selected,setSelected]=useState(0);
 return <><p className="slide-description">Select a line to read what it means. This walkthrough explains the example; you will run Python on the coding slides.</p><div className="walkthrough"><div className="walkthrough-code" role="group" aria-label="Code lines">{lines.map(([code],i)=><button key={i} aria-label={`Line ${i+1}: ${code.trim()}`} aria-pressed={selected===i} onClick={()=>setSelected(i)}><span aria-hidden="true">{i+1}</span><code>{code}</code></button>)}</div><section className="line-explanation" aria-live="polite"><span className="eyebrow">LINE {selected+1}</span><h3>What This Line Means</h3><p>{lines[selected][1]}</p></section></div></>
}
function Prediction({prediction:p,answer,onAnswer}){
 const chosen=Number.isInteger(answer)&&answer>=0&&answer<p.choices.length;
 return <div className="prediction-layout"><section className="prediction-code"><h3>Read the Example</h3><pre>{p.code}</pre>{p.input!==undefined&&<p className="prediction-input"><strong>Input answer:</strong> <code>{p.input}</code></p>}<p className="caption">Follow the instructions in order before choosing an answer.</p></section><section className="quiz prediction-quiz" aria-label="Output prediction"><h3>{p.question}</h3><div className="quiz-options">{p.choices.map((choice,i)=><button key={i} aria-pressed={answer===i} className={answer===i?(i===p.correct?'correct':'retry'):''} onClick={()=>onAnswer(i)}><span>{String.fromCharCode(65+i)}</span><pre>{choice}</pre></button>)}</div>{chosen&&<p className="quiz-feedback" role="status"><strong>{answer===p.correct?'Correct.':'Try again.'}</strong> {p.why[answer]}</p>}</section></div>
}

export default function LearnSlideshow({lesson:l,progress,setProgress,updateTask,onCreateDraft}){
 const depth=getDepth(l),slideTypes=depth?allSlideTypes:allSlideTypes.filter(s=>!['investigate','transfer'].includes(s.id));
 const content=getSlides(l),saved=progress.learning[l.id]||{};
 const index=Math.max(0,slideTypes.findIndex(s=>s.id===saved.slide));
 const slide=slideTypes[index],frame=useRef(null),heading=useRef(null),moved=useRef(false);
 const title=slide.id==='investigate'?depth.title:slide.id==='transfer'?depth.transfer.title:slide.id==='idea'?content.title:slide.id==='explore'?content.exploreTitle:slide.label;
 const saveLearning=patch=>setProgress(p=>({...p,learning:{...p.learning,[l.id]:{...p.learning[l.id],...patch}}}));
 function go(next){if(next<0||next>=slideTypes.length||next===index)return;moved.current=true;saveLearning({slide:slideTypes[next].id})}
 useEffect(()=>{if(!moved.current)return;moved.current=false;heading.current?.focus({preventScroll:true});frame.current?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})},[index]);
 function keyboard(event){if(event.target.closest('input,textarea,select,button,a,summary,[contenteditable]'))return;if(event.key==='ArrowRight'){event.preventDefault();go(index+1)}if(event.key==='ArrowLeft'){event.preventDefault();go(index-1)}}
 function editor(kind,task){
  const key=kind==='run'?`${l.id}:example`:`${l.id}:learn-${kind}`;
  return <Workbench key={key} id={key} initialCode={task?.starter??l.code} input={task?.input??l.input??''} saved={progress.tasks[key]} checks={task?.checks||[]} onSave={patch=>updateTask(key,patch)} onGrade={(passed,code,input)=>updateTask(key,{passed,code,input})} onCopy={(code,input)=>onCreateDraft({name:`${l.title} — ${slide.label}`,code,input})} studio minRows={8} interactive={kind==='run'&&l.interactive} network={kind==='run'&&l.network}/>;
 }
 const project=getProject(l);
 return <section ref={frame} className="lesson-slideshow" aria-label={`${l.title}: learning slides`} aria-roledescription="carousel" tabIndex={0} onKeyDown={keyboard} aria-describedby="slide-keyboard-help">
 <div className="deck-toolbar"><div><p className="deck-position" role="status">Slide {index+1} of {slideTypes.length}</p><span className="caption">Your place and code are saved.</span></div><label><span>Go to a slide</span><select aria-label="Go to a slide" value={slide.id} onChange={e=>go(slideTypes.findIndex(s=>s.id===e.target.value))}>{slideTypes.map((s,i)=><option key={s.id} value={s.id}>{i+1}. {s.label}</option>)}</select></label></div>
 <div className="deck-progress" aria-hidden="true">{slideTypes.map((s,i)=><span key={s.id} className={i<=index?'reached':''}/>)}</div>
 <div key={slide.id} className={`slide-body slide-${slide.id}`} role="group" aria-roledescription="slide" aria-label={`${index+1} of ${slideTypes.length}: ${title}`}>
 <header className="slide-heading"><p className="eyebrow">{slide.id==='idea'?'UNDERSTAND':slide.id==='predict'?'MAKE A PREDICTION':slide.id==='review'?'REVIEW':['build','repair','transfer'].includes(slide.id)?'WRITE AND RUN PYTHON':slide.id==='run'?'RUN REAL PYTHON':slide.id==='read'?'CODE WALKTHROUGH':slide.id==='investigate'?'COMPARE TWO CASES':l.experiment?'COMPARE REAL PYTHON RUNS':'INTERACTIVE DIAGRAM'}</p><h2 ref={heading} tabIndex={-1}>{title}</h2></header>
 {slide.id==='idea'&&<div className="idea-slide-grid"><div className="slide-prose">{content.meaning.map(text=><p key={text}>{text}</p>)}</div><div><Anatomy parts={content.parts}/>{l.sources&&<div className="api-sources"><h3>API References</h3>{l.sources.map(([label,url])=><a key={url} href={url} target="_blank" rel="noreferrer">{label}</a>)}</div>}</div></div>}
 {slide.id==='read'&&<Walkthrough lines={content.walk}/>}
 {slide.id==='explore'&&(l.experiment?<IntermediateExperiment lesson={l} progress={progress} setProgress={setProgress} updateTask={updateTask}/>:<div className="explore-slide-grid"><div className="slide-prose"><p>{content.explore}</p><h3>Try These Changes</h3><ol>{content.try.map(text=><li key={text}>{text}</li>)}</ol><p className="slide-takeaway">{content.takeaway}</p></div><Visual kind={l.visual}/></div>)}
 {slide.id==='predict'&&<Prediction prediction={content.prediction} answer={saved.prediction} onAnswer={prediction=>saveLearning({prediction})}/>}
 {slide.id==='run'&&<><p className="slide-description">{content.runNote}</p>{editor('run')}<p className="slide-tip">{l.change}</p></>}
 {['build','repair'].includes(slide.id)&&<><p className="slide-description">{content[slide.id].prompt}</p>{editor(slide.id,content[slide.id])}<div className="slide-code-help"><details className="hint"><summary>{slide.id==='repair'?'What to check':'Show a hint'}</summary>{slide.id==='repair'&&content.repairWhy!==content.repair.hint&&<p>{content.repairWhy}</p>}<p>{content[slide.id].hint}</p></details><details className="solution"><summary>See one solution</summary><p>Compare it with your code. Then close it and try again.</p><pre>{content[slide.id].solution}</pre></details></div></>}
 {slide.id==='investigate'&&<DepthExperiment lesson={l} progress={progress} setProgress={setProgress} updateTask={updateTask} onCreateDraft={onCreateDraft}/>}
 {slide.id==='transfer'&&<><p className="slide-description">{depth.transfer.prompt}</p>{editor('transfer',depth.transfer)}<div className="slide-code-help"><details className="hint"><summary>Show a hint</summary><p>{depth.transfer.hint}</p></details><details className="solution"><summary>See one solution</summary><pre>{depth.transfer.solution}</pre></details></div></>}
 {slide.id==='review'&&<><div className="slide-review-grid"><section><h3>Remember These Ideas</h3><ul className="recap-list">{content.recap.map(text=><li key={text}><CheckCircle2 size={18}/><span>{text}</span></li>)}</ul><details className="slide-words"><summary>Useful Words</summary><dl>{l.words.map(([word,meaning])=><React.Fragment key={word}><dt>{word}</dt><dd>{meaning}</dd></React.Fragment>)}</dl></details></section><section className="quiz" aria-label="Quick check"><p className="eyebrow">QUICK CHECK</p><h3>{l.quiz.question}</h3><div className="quiz-options">{l.quiz.options.map((option,i)=><button key={option} aria-pressed={progress.quizzes[l.id]===i} className={progress.quizzes[l.id]===i?(i===l.quiz.answer?'correct':'retry'):''} onClick={()=>setProgress(p=>({...p,quizzes:{...p.quizzes,[l.id]:i}}))}><span>{String.fromCharCode(65+i)}</span>{option}</button>)}</div>{progress.quizzes[l.id]!==undefined&&<p className="quiz-feedback" role="status"><strong>{progress.quizzes[l.id]===l.quiz.answer?'Correct.':'Try again.'}</strong> {l.quiz.why}</p>}</section></div><div className="lesson-bridge"><h3>Use These Skills Next</h3><p>The Practice section has short tasks with code checks. In Project, build <strong>{project.title}</strong>: {project.description.charAt(0).toLowerCase()+project.description.slice(1)}</p></div></>}
 </div>
 <div className="slide-navigation"><button className="button secondary" disabled={index===0} onClick={()=>go(index-1)} aria-label="Previous slide"><ArrowLeft size={17}/>Back</button><p className="caption">{index===slideTypes.length-1?'You can return to any slide.':`Next: ${slideTypes[index+1].label}`}</p>{index<slideTypes.length-1?<button className="button" onClick={()=>go(index+1)} aria-label="Next slide">Next<ArrowRight size={17}/></button>:<a className="button" href={`#lesson/${l.id}/practice`}>Go to practice<ArrowRight size={17}/></a>}</div>
 <span className="sr-only" id="slide-keyboard-help">Use the arrow keys when the slideshow or slide title is focused. Arrow keys keep their usual meaning inside code editors and controls.</span>
 </section>
}

function IntermediateExperiment({lesson:l,progress,setProgress,updateTask}){
 const selected=progress.learning[l.id]?.experiment||l.experiment[0].id;
 const example=l.experiment.find(c=>c.id===selected)||l.experiment[0];
 const key=`${l.id}:explore:${example.id}`;
 return <div className="intermediate-experiment"><p className="slide-description">{l.network?'These are constructed sample records, not live API results. ':''}Compare the cases using real Python. Predict a result, run the code, then use Watch each step to inspect it. Edits are saved separately for each case.</p><div className="task-tabs" role="group" aria-label="Experiment cases">{l.experiment.map(c=><button key={c.id} aria-pressed={example.id===c.id} onClick={()=>setProgress(p=>({...p,learning:{...p.learning,[l.id]:{...p.learning[l.id],experiment:c.id}}}))}>{c.label}</button>)}</div><Workbench key={key} id={key} initialCode={example.code} saved={progress.tasks[key]} onSave={patch=>updateTask(key,patch)} studio minRows={8}/></div>
}
