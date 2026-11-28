import React from 'react';
import Workbench from './Workbench.jsx';
import {getDepth,getProjects,getActiveProject} from './course-catalog.js';

export function ProjectChoice({lesson,progress,setProgress}){
 const choices=getProjects(lesson),selected=getActiveProject(lesson,progress);
 if(choices.length<2)return null;
 return <label className="practice-picker project-choice"><span>Project choice</span><select aria-label="Project choice" value={selected.id} onChange={e=>{const projectVariant=e.target.value;setProgress(p=>({...p,learning:{...p.learning,[lesson.id]:{...p.learning[lesson.id],projectVariant}}}))}}>{choices.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select><small>Each project saves its own work.</small></label>;
}

export function DepthExperiment({lesson:l,progress,setProgress,updateTask,onCreateDraft}){
 const depth=getDepth(l),selected=progress.learning[l.id]?.depthCase,example=depth.cases.find(c=>c.id===selected)||depth.cases[0],key=`${l.id}:deeper:${example.id}`,saved=progress.tasks[key]||{};
 return <div className="depth-experiment"><p className="slide-description">{depth.why}</p><label className="depth-case-picker">Example case<select aria-label="Example case" value={example.id} onChange={e=>{const depthCase=e.target.value;setProgress(p=>({...p,learning:{...p.learning,[l.id]:{...p.learning[l.id],depthCase}}}))}}>{depth.cases.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label><Workbench key={key} id={key} initialCode={example.code} input={example.input||''} saved={saved} onSave={patch=>updateTask(key,patch)} onCopy={(code,input)=>onCreateDraft({name:depth.title,code,input})} studio minRows={8}/><p className="slide-tip">{depth.notice}</p><details className="quiet-disclosure"><summary>Write your prediction and observation</summary><label className="depth-notes-label">What did you expect, and what happened?<textarea aria-label="Experiment notes" rows={4} maxLength={3000} value={saved.notes||''} onChange={e=>updateTask(key,{notes:e.target.value})}/></label><p className="small-note">These notes are saved separately for each case. Use Watch each step to explain the changes.</p></details></div>;
}
