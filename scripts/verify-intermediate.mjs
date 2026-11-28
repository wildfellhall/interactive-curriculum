import {expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
import {intermediateLessons} from '../src/program-course.js';
import {intermediateLessons as references} from '../src/intermediate.js';
import {slideTypes} from '../src/lesson-slides.js';
import {chooseSlide} from './verify-slides.mjs';
const api='https://openlibrary.org/search.json?**';
// Deliberate test fixtures. The application never substitutes these for live data.
const fixture={docs:[{key:'/works/TEST_A',title:'Fixture Atlas',author_name:['Test Writer']},{key:'/works/TEST_B',title:'Fixture Without an Author'}]};
const respond=(route,body=fixture,status=200)=>route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(body)});

export async function verifyIntermediatePython(page){
 await page.context().route(api,route=>respond(route));
 let programs=0,solutions=0;
 for(const lesson of [...intermediateLessons,...references]){
  const cases=[{label:'example',code:lesson.code,input:lesson.input},{label:'walkthrough',code:lesson.walk.map(row=>row[0]).join('\n')},{label:'prediction',code:lesson.predict.code,expected:lesson.predict.expected},{label:'project',code:lesson.project.starter,input:lesson.project.input},...lesson.experiment.map(c=>({...c,label:'experiment '+c.id}))];
  for(const item of cases){
   const result=await page.evaluate(request=>window.testRun(request),{code:item.code,input:item.input||'',checks:[]});
   expect(result.error,lesson.id+' '+item.label).toBeNull();
   if(item.expected!==undefined)expect(result.output,lesson.id+' '+item.label).toBe(item.expected);
   if(lesson.id==='app-api'&&item.label==='example')expect(result.output).toContain('Fixture Atlas');
   programs++;
  }
  for(const task of [lesson.build,lesson.repair,...lesson.practice,lesson.homework]){
   const result=await page.evaluate(request=>window.testRun(request),{code:task.solution,input:task.input||'',checks:task.checks});
   expect(result.error,lesson.id+' '+task.id).toBeNull();
   expect(result.checks.every(c=>c.passed),JSON.stringify({lesson:lesson.id,task:task.id,checks:result.checks})).toBe(true);
   for(const code of [task.starter,'pass']){
    const unfinished=await page.evaluate(request=>window.testRun(request),{code,input:task.input||'',checks:task.checks});
    expect(!unfinished.error&&unfinished.checks.length>0&&unfinished.checks.every(c=>c.passed),lesson.id+' '+task.id+' unfinished').toBe(false);
   }
   solutions++;
  }
 }
 await page.context().unroute(api);
 const file=await page.evaluate(()=>window.testRun({code:'with open("report.txt", "w", encoding="utf-8") as f:\n    f.write("Hello, café\\n")',input:'',checks:[]}));
 expect(file.files).toEqual([{name:'report.txt',text:'Hello, café\n'}]);
 const fresh=await page.evaluate(()=>window.testRun({code:'import os\nprint(os.path.exists("report.txt"))',input:'',checks:[]}));
 expect(fresh.output).toBe('False\n');expect(fresh.files).toEqual([]);
 const uploaded=await page.evaluate(()=>window.testRun({code:'import json\nprint(json.load(open("save.json"))["score"])',input:'',checks:[],files:[{name:'save.json',text:'{"score":30}'}]}));
 expect(uploaded.error).toBeNull();expect(uploaded.output).toBe('30\n');
 const hidden=await page.evaluate(()=>window.testRun({code:'pass',input:'',checks:[{label:'fixture',test:'_write_text("hidden.txt","test data")'}]}));
 expect(hidden.checks[0].passed).toBe(true);expect(hidden.files).toEqual([]);
 const nested=await page.evaluate(()=>window.testRun({code:'import math\nclass Box:\n    def __init__(self, value):\n        self.value = value\nbox = Box(Box(Box(2)))\nitems = {2, 1}\nprint(math.ceil(2.1))',input:'',checks:[]}));
 expect(nested.error).toBeNull();expect(nested.output).toBe('3\n');
 expect(nested.variables.find(v=>v.name==='items').value).toEqual([1,2]);
 console.log(`Intermediate and reference Python: ${programs} examples and ${solutions} solutions passed. Unfinished submissions, async API parsing with test fixtures, file loading/isolation, and nested values passed.`);
}

export async function verifyIntermediateUI(page){
 const goto=async hash=>page.goto('http://127.0.0.1:5282/'+hash,{waitUntil:'networkidle'});
 const editor=page.getByRole('textbox',{name:'Python code',exact:true});
 const check=async()=>{await page.getByRole('button',{name:'Check my work',exact:true}).click();await expect(page.locator('.check-results')).toContainText('All code checks passed',{timeout:30000})};
 const start=async()=>page.getByRole('button',{name:'Run code',exact:true}).click();
 const answer=async(prompt,text)=>{await expect(page.locator('.live-answer label')).toContainText(prompt,{timeout:30000});await page.locator('.live-answer input').fill(text);await page.getByRole('button',{name:'Send answer',exact:true}).click()};
 const before=await page.evaluate(()=>{const p=JSON.parse(localStorage.getItem('python-basics-work-v1'));return {tasks:p.tasks,quizzes:p.quizzes}});
 await goto('#courses');await expect(page.locator('.course-card')).toHaveCount(3);
 const beginnerCount=await page.locator('.course-card.beginner .course-card-progress').innerText();
 await page.getByRole('link',{name:'Open intermediate course',exact:true}).click();
 await expect(page.locator('main h1')).toHaveText('Intermediate Python');
 await expect(page.locator('.lesson-links a')).toHaveCount(10);
 await page.screenshot({path:'test-results/intermediate-programs-desktop.png',fullPage:true});
 await page.getByRole('link',{name:'Start lesson 1',exact:false}).click();
 await chooseSlide(page,'run');
 expect(await page.evaluate(()=>crossOriginIsolated)).toBe(true);
 await start();await answer('Choose:','bad');
 await expect(page.locator('.output')).toContainText('Choose 1, 2, or q.');
 await answer('Choose:','1');await answer('Hours:','wrong');
 await expect(page.locator('.output')).toContainText('Enter a number, such as 2.5.');
 await answer('Hours:','1.5');await expect(page.locator('.output')).toContainText('Minutes: 90');
 await page.screenshot({path:'test-results/live-python-desktop.png',fullPage:true});
 await answer('Choose:','q');await expect(page.locator('.output')).toContainText('Goodbye');
 await expect(page.getByRole('button',{name:'Run code',exact:true})).toBeVisible();
 // A stopped, waiting run must not block the next run.
 await start();await expect(page.locator('.live-answer')).toBeVisible();await page.getByRole('button',{name:'Stop',exact:true}).click();
 await expect(page.locator('.live-answer')).toHaveCount(0);await start();await answer('Choose:','q');await expect(page.locator('.output')).toContainText('Goodbye');
 const first=intermediateLessons[0];
 await chooseSlide(page,'review');await page.locator('.quiz-options button').nth(first.quiz.answer).click();
 await page.getByRole('link',{name:'Go to practice',exact:true}).click();
 await expect(page.locator('.assignment-brief h2')).toHaveText(first.practice[0].title);
 await editor.fill(first.practice[0].solution);await check();
 await page.getByRole('button',{name:'Next practice task',exact:true}).click();
 await expect(page.locator('.assignment-brief h2')).toHaveText(first.practice[1].title);
 await editor.fill(first.practice[1].solution);await check();
 await page.getByRole('link',{name:'Continue to project',exact:true}).click();
 await expect(page.locator('.activity-heading h2')).toHaveText(first.project.title);
 await page.locator('.project-planning > summary').click();
 await page.getByLabel('Plan Your Idea',{exact:true}).fill('Add a converter and test decimal input.');
 await editor.fill(first.project.starter+'\n# My extension plan: add a converter.');
 await page.reload({waitUntil:'networkidle'});await expect(editor).toHaveValue(/My extension plan/);
 await expect(page.getByLabel('Plan Your Idea',{exact:true})).toHaveValue('Add a converter and test decimal input.');
 await page.getByRole('link',{name:'Open homework',exact:true}).click();await expect(page.locator('.assignment-brief h2')).toHaveText(first.homework.title);
 await editor.fill(first.homework.solution);await check();
 await page.getByLabel('Explain Your Code',{exact:true}).fill('Valid commands return a calculation. An unknown command raises ValueError.');
 for(const box of await page.locator('.self-check input').all())await box.check();
 await goto('#courses');await expect(page.locator('.course-card.intermediate .course-card-progress')).toHaveText('1 of 10 lessons finished');
 await expect(page.locator('.course-card.beginner .course-card-progress')).toHaveText(beginnerCount);
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('python-basics-work-v1')));
 for(const [key,value] of Object.entries(before.tasks))expect(after.tasks[key],key+' existing work').toEqual(value);
 for(const [key,value] of Object.entries(before.quizzes))expect(after.quizzes[key],key+' existing quiz').toEqual(value);
 await goto('#reference');await expect(page.locator('main h1')).toHaveText('Python Reference');await expect(page.locator('.lesson-links a')).toHaveCount(10);
 await goto('#lesson/mid-collections/learn');await expect(page.locator('.lesson-heading')).toContainText('Python Reference');

 // A downloaded save can be supplied to a later run, without persisting runtime files.
 await goto('#lesson/app-saves/project');
 await page.locator('.starting-files summary').click();
 await page.locator('input[type=file]').setInputFiles({name:'save.json',mimeType:'application/json',buffer:Buffer.from('{"name":"Nova","score":30}')});
 await expect(page.locator('.starting-files li')).toContainText('save.json');
 await start();await expect(page.locator('.output')).toContainText('Loaded your save');
 await answer('earn, save, or quit:','earn');await expect(page.locator('.output')).toContainText('Score: 40');
 await answer('earn, save, or quit:','save');await answer('earn, save, or quit:','quit');
 await page.locator('.run-files summary').filter({hasText:'save.json'}).click();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download save.json',exact:true}).click();
 const file=await download;expect(JSON.parse(await readFile(await file.path(),'utf8'))).toEqual({name:'Nova',score:40});
 await page.reload({waitUntil:'networkidle'});await expect(page.locator('.starting-files li')).toContainText('save.json');
 await page.locator('.starting-files summary').click();await page.getByRole('button',{name:'Remove save.json',exact:true}).click();
 await start();await expect(page.locator('.output')).toContainText('Score: 0');await answer('earn, save, or quit:','quit');

 // Mock only the service response; run the actual Python request and UI paths.
 let requests=[];let apiMode='ok';
 await page.context().route(api,route=>{requests.push(new URL(route.request().url()));return respond(route,apiMode==='empty'?{docs:[]}:apiMode==='error'?{error:'test outage'}:fixture,apiMode==='error'?503:200)});
 await goto('#lesson/app-api/learn');await chooseSlide(page,'run');
 expect(requests).toHaveLength(0);await start();await expect(page.locator('.live-answer')).toBeVisible();expect(requests).toHaveLength(0);
 await answer('Book search:','space & maps');await expect(page.locator('.output')).toContainText('Fixture Atlas',{timeout:30000});
 expect(requests[0].searchParams.get('q')).toBe('space & maps');expect(requests[0].searchParams.get('limit')).toBe('5');
 await expect(page.locator('.output')).toContainText('Unknown author');
 apiMode='empty';await start();await answer('Book search:','empty');await expect(page.locator('.output')).toContainText('No books found',{timeout:30000});
 apiMode='error';await start();await answer('Book search:','outage');await expect(page.locator('.output')).toContainText('Search unavailable:',{timeout:30000});await expect(page.locator('.output')).toContainText('HTTP 503');
 apiMode='ok';requests=[];
 await goto('#lesson/app-library/project');await start();
 await answer('Search, /list, /save, or /quit:','space');await answer('Save which number?','1');
 await answer('Search, /list, /save, or /quit:','SPACE');await answer('Save which number?','1');
 expect(requests).toHaveLength(1);
 await answer('Search, /list, /save, or /quit:','/save');await answer('Search, /list, /save, or /quit:','/quit');
 await expect(page.locator('.run-files')).toContainText('reading-list.json');
 await page.locator('.run-files summary').click();expect(JSON.parse(await page.locator('.run-files pre').innerText())).toHaveLength(1);
 await page.context().unroute(api);
 console.log('Live prompts, invalid inputs, Stop/restart, independent progress, old reference routes, saved code, file upload/download, API query encoding, no-results/errors, and request caching passed.');

 for(const lesson of intermediateLessons){
  await goto(`#lesson/${lesson.id}/learn`);
  for(const slide of slideTypes){await chooseSlide(page,slide.id);await expect(page.locator('.slide-heading h2')).toBeVisible()}
  for(const mode of ['practice','project','homework']){
   await page.locator('.lesson-tabs').getByRole('link',{name:new RegExp(mode,'i')}).click();await expect(editor).toBeVisible();await expect(page.locator('main')).not.toContainText('undefined');
  }
 }
 const routes=['#courses','#intermediate','#lesson/types/learn','#lesson/app-menu/learn','#lesson/app-api/project','#lesson/app-saves/homework','#reference'];
 for(const hash of routes){
  await goto(hash);if(hash.includes('types'))await chooseSlide(page,'explore');if(hash.includes('app-menu')){await chooseSlide(page,'run');await start();await expect(page.locator('.live-answer')).toBeVisible()}
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),hash).toEqual([]);
 }
 for(const width of [360,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  for(const hash of routes){await goto(hash);if(hash.includes('app-menu')){await chooseSlide(page,'run');await start();await expect(page.locator('.live-answer')).toBeVisible()}expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${width} ${hash}`).toBeLessThanOrEqual(width)}
 }
 await page.setViewportSize({width:390,height:844});await goto('#intermediate');
 await page.getByRole('button',{name:'Larger text',exact:true}).click();
 for(const hash of routes){await goto(hash);expect(await page.evaluate(()=>document.documentElement.scrollWidth),'larger text '+hash).toBeLessThanOrEqual(390)}
 await goto('#intermediate');await page.screenshot({path:'test-results/intermediate-programs-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Larger text',exact:true}).click();await page.setViewportSize({width:1440,height:1000});
 console.log('All 100 program slides, 30 activities, value-type diagrams, accessibility, five screen widths, and larger text passed.');
}
