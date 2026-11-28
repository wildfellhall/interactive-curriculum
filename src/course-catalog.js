import {lessons,sections,lessonById,glossary} from './curriculum.js';
import {intermediateLessons,intermediateSections} from './program-course.js';
import {intermediateLessons as referenceLessons,intermediateSections as referenceSections} from './intermediate.js';
import {slideContent} from './lesson-slides.js';
import {projectById,lessonProjectIds,projectConnections,prompts,practiceForLesson} from './creative.js';
import {modelLessons,modelSections} from './model-course.js';
import {beginnerDepth} from './beginner-depth.js';
import {intermediateDepth} from './intermediate-depth.js';
import {modelDepth} from './model-depth.js';
export const courses={
 beginner:{id:'beginner',title:'Beginner Python',heading:'Learn Python',href:'#lessons',lessons,sections,description:'Learn strings, integers, floats, booleans, dictionaries, loops, functions, and classes.',prerequisite:'No coding experience needed.'},
 intermediate:{id:'intermediate',title:'Intermediate Python',heading:'Intermediate Python',href:'#intermediate',lessons:intermediateLessons,sections:intermediateSections,description:'Build playable games, search tools, and longer programs using real APIs and saved files.',prerequisite:'Know strings, integers, floats, booleans, dictionaries, loops, functions, and basic classes.'},
 models:{id:'models',title:'Small Language Models',heading:'Small Language Models',href:'#models',lessons:modelLessons,sections:modelSections,description:'Explore tokens, vectors, attention, and training. Build a tiny model, then see how larger AI systems use these ideas.',prerequisite:'No coding experience needed. Basic multiplication helps.',action:'Open language model course'}
};
export const referenceCourse={id:'reference',title:'Python Reference',heading:'Python Reference',href:'#reference',lessons:referenceLessons,sections:referenceSections,prerequisite:'Review a concept when you need it for a project.'};
export const allLessonById={...Object.fromEntries(Object.entries(lessonById).map(([id,l])=>[id,{...l,course:'beginner'}])),...Object.fromEntries(referenceLessons.map(l=>[l.id,{...l,course:'reference'}])),...Object.fromEntries(intermediateLessons.map(l=>[l.id,l])),...Object.fromEntries(modelLessons.map(l=>[l.id,l]))};
export const courseForLesson=l=>l.course==='reference'?referenceCourse:courses[l.course||'beginner'];
export const getProject=l=>l.project||projectById[lessonProjectIds[l.id]];
export const getDepth=l=>({...beginnerDepth,...intermediateDepth,...modelDepth})[l.id];
export const getProjects=l=>[getProject(l),getDepth(l)?.project].filter(Boolean);
export const getActiveProject=(l,p)=>getProjects(l).find(project=>project.id===p.learning[l.id]?.projectVariant)||getProject(l);
export const getSlides=l=>l.slides||slideContent[l.id];
export const getPrompts=l=>l.prompts||prompts[l.id];
export const getProjectConnection=l=>l.project?.connection||projectConnections[l.id];
export const getPractice=l=>l.course&&l.course!=='beginner'?l.practice.map(t=>({...t,kind:t.kind||'guided',storageKey:`${l.id}:${t.id}`})):practiceForLesson(l);
export const allGlossary=Object.entries(Object.fromEntries([...referenceLessons.flatMap(l=>l.words),...intermediateLessons.flatMap(l=>l.words),...modelLessons.flatMap(l=>l.words),...glossary,['parameter','In Python, a named input to a function. In a model, a learned stored value such as a weight or bias.']])).sort(([a],[b])=>a.localeCompare(b));
