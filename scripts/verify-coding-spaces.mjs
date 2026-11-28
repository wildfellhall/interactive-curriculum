import {expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {lessons,lessonById} from '../src/curriculum.js';
import {challenges,projects,templates,programFilename,lessonProjectIds,projectById,practiceForLesson} from '../src/creative.js';

export async function verifyCreativePython(page){
 for(const lesson of lessons){
  const project=lesson.project||projectById[lessonProjectIds[lesson.id]];
  expect(project,lesson.id+' has a project').toBeTruthy();
  expect(project.lessons.every(id=>lessonById[id].index<=lessonById[lesson.id].index),lesson.id+' project uses only known concepts').toBe(true);
  expect(practiceForLesson(lesson).length,lesson.id+' includes independent practice').toBeGreaterThanOrEqual(3);
 }

 for(const c of challenges){
  const result=await page.evaluate(request=>window.testRun(request),{code:c.solution,input:c.input||'',checks:c.checks});
  expect(result.error,c.id).toBeNull();
  expect(result.checks.every(check=>check.passed),JSON.stringify({id:c.id,checks:result.checks})).toBe(true);
  const starter=await page.evaluate(request=>window.testRun(request),{code:c.starter,input:c.input||'',checks:c.checks});
  expect(starter.checks.every(check=>check.passed),`${c.id} unfinished work must fail`).toBe(false);
 }
 for(const p of [...projects,...templates]){
  const result=await page.evaluate(request=>window.testRun(request),{code:p.starter??p.code,input:p.input||'',checks:[]});
  expect(result.error,`${p.id} starter`).toBeNull();
 }
 for(const [id,values] of [['minutes',['0','5']],['tickets',['12','18']]]){
  const c=challenges.find(item=>item.id===id);
  for(const input of values){
   const result=await page.evaluate(request=>window.testRun(request),{code:c.solution,input,checks:c.checks});
   expect(result.checks.every(check=>check.passed),`${id} input ${input}`).toBe(true);
  }
 }
 console.log(`Real Python: ${challenges.length} challenge solutions, unfinished submissions, boundary inputs, and all project/example starters passed.`);
}

export async function verifyCodingSpaces(page,browser){
 const goto=async hash=>{await page.goto('http://127.0.0.1:5282/'+hash,{waitUntil:'networkidle'})};
 const editor=page.getByRole('textbox',{name:'Python code',exact:true});
 const run=async output=>{await page.getByRole('button',{name:'Run code',exact:true}).click();await expect(page.locator('.output')).toHaveText(output,{timeout:30000})};
 await goto('#build');
 await expect(page.locator('.project-card')).toHaveCount(lessons.length);
 await page.screenshot({path:'test-results/build-desktop.png',fullPage:true});
 await page.getByRole('link',{name:'Open Playground',exact:true}).click();
 await expect(editor).toHaveValue('# Write your code here.\n');
 await editor.fill('name = "Asha"\nprint("Hello, " + name)');
 await page.getByLabel('Program name',{exact:true}).fill('My greeting');
 await run('Hello, Asha\n');
 await page.getByRole('button',{name:'New blank',exact:true}).click();
 await expect(editor).toHaveValue('# Write your code here.\n');
 await editor.fill('print(2 + 3)');
 await page.getByLabel('Program name',{exact:true}).fill('Addition');
 await run('5\n');
 await page.getByLabel('Open a saved program',{exact:true}).selectOption({label:'My greeting'});
 await expect(editor).toHaveValue('name = "Asha"\nprint("Hello, " + name)');
 await page.reload({waitUntil:'networkidle'});
 await expect(page.getByLabel('Program name',{exact:true})).toHaveValue('My greeting');
 await expect(editor).toHaveValue('name = "Asha"\nprint("Hello, " + name)');
 await page.getByRole('button',{name:'Duplicate',exact:true}).click();
 await expect(page.getByLabel('Program name',{exact:true})).toHaveValue('My greeting copy');
 await editor.fill('print("A new greeting")');
 await page.getByLabel('Open a saved program',{exact:true}).selectOption({label:'My greeting'});
 await expect(editor).toHaveValue('name = "Asha"\nprint("Hello, " + name)');
 await page.getByText('Start a new program from an example',{exact:true}).click();
 await page.getByRole('button',{name:/Ask a Question/}).click();
 await expect(page.getByLabel('Program name',{exact:true})).toHaveValue('Ask a Question');
 await expect(page.locator('.input-box textarea')).toHaveValue('Asha');
 await run('Hello, Asha\n');
 await page.locator('.code-tools > summary').click();
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Save .py',exact:true}).click();
 expect((await download).suggestedFilename()).toBe(programFilename('Ask a Question'));
 await page.screenshot({path:'test-results/playground-desktop.png',fullPage:true});

 await goto('#lesson/lists/project');
 await expect(page.locator('main h1')).toHaveText('Keep Items in a List');
 await expect(page.locator('.activity-heading h2')).toHaveText('A Music List');
 await page.getByText('Try a Different Idea',{exact:true}).click();
 const scratch=page.locator('.lesson-scratch');
 const scratchEditor=scratch.getByRole('textbox',{name:'Python code',exact:true});
 await expect(scratch.locator('.idea-list li')).toHaveCount(3);
 await expect(scratchEditor).toHaveValue('# Build your own program below.\n');
 await scratchEditor.fill('places = ["hill", "lake"]\nprint(places[1])');
 await scratch.getByRole('button',{name:'Run code',exact:true}).click();
 await expect(scratch.locator('.output')).toHaveText('lake\n',{timeout:30000});
 await scratch.locator('.code-tools > summary').click();
 await scratch.getByRole('button',{name:'Open a copy in Playground',exact:true}).click();
 await expect(page.locator('main h1')).toHaveText('Python Playground');
 await expect(editor).toHaveValue('places = ["hill", "lake"]\nprint(places[1])');
 await editor.fill('print("Only the copy changes")');
 // The old Create link still opens the saved experiment within its lesson project.
 await goto('#lesson/lists/create');
 await expect(scratchEditor).toHaveValue('places = ["hill", "lake"]\nprint(places[1])');
 await expect(page.locator('.lesson-project .code-input')).toHaveValue(projectById.playlist.starter);
 await goto('#lesson/lists/learn');
 await page.getByRole('combobox',{name:'Go to a slide',exact:true}).selectOption('run');
 await expect(editor).not.toHaveValue('places = ["hill", "lake"]\nprint(places[1])');

 await goto('#project/story');
 await page.locator('.project-planning > summary').click();
 await page.getByLabel('Plan Your Idea',{exact:true}).fill('A character finds a key in a library.');
 const storyCode='character = input()\nplace = input()\nobject_name = input()\nprint(character + " found " + object_name + " in " + place)';
 await editor.fill(storyCode);
 await run('Meera found a silver key in a library\n');
 await page.locator('.project-review-panel > summary').click();
 for(const checkbox of await page.locator('.project-review input').all())await checkbox.check();
 await expect(page.getByText('Self-review complete',{exact:true})).toBeVisible();
 await page.getByLabel('What did you change or discover?',{exact:true}).fill('Text can be joined with +.');
 await page.reload({waitUntil:'networkidle'});
 await expect(editor).toHaveValue(storyCode);
 await page.locator('.project-planning > summary').click();
 await page.locator('.project-review-panel > summary').click();
 await expect(page.getByLabel('Plan Your Idea',{exact:true})).toHaveValue('A character finds a key in a library.');
 await expect(page.getByText('Self-review complete',{exact:true})).toBeVisible();
 await page.screenshot({path:'test-results/project-desktop.png',fullPage:true});
 await editor.fill(storyCode+'\nprint("The end")');
 await expect(page.locator('.project-review input:checked')).toHaveCount(0);
 await goto('#project/pet');
 await expect(editor).toHaveValue(projects.find(p=>p.id==='pet').starter);
 await expect(page.getByLabel('Plan Your Idea',{exact:true})).toHaveValue('');

 await goto('#challenges');
 await expect(page.locator('.challenge-card')).toHaveCount(challenges.length);
 await page.getByRole('button',{name:'Fix code',exact:true}).click();
 await expect(page.locator('.challenge-card')).toHaveCount(2);
 await page.getByLabel('Topic',{exact:true}).selectOption('print');
 await expect(page.locator('.challenge-card')).toHaveCount(0);
 await expect(page.locator('.empty-challenges')).toBeVisible();
 await page.getByLabel('Topic',{exact:true}).selectOption('functions');
 await expect(page.locator('.challenge-card')).toHaveCount(1);
 await page.getByRole('link',{name:'Open exercise',exact:true}).click();
 await expect(page.locator('main h1')).toHaveText('Make Your Own Function');
 await expect(page.locator('.assignment-brief h2')).toHaveText('Fix the Missing Result');
 await expect(page.locator('.site-header nav a[aria-current=page]')).toHaveText('Courses');
 await expect(page.locator('.lesson-tabs a[aria-current=page]')).toHaveText('Practice');
 await run('12\nNone\n');
 await page.getByRole('button',{name:'Check my work',exact:true}).click();
 await expect(page.locator('.check-results')).toContainText('Not yet',{timeout:30000});
 const solution=challenges.find(c=>c.id==='repair-return').solution;
 await editor.fill(solution);
 await page.getByRole('button',{name:'Check my work',exact:true}).click();
 await expect(page.locator('.check-results')).toContainText('All code checks passed',{timeout:30000});
 await goto('#challenges');
 await expect(page.locator('.challenge-passed')).toHaveCount(1);
 await goto('#challenge/repair-return');
 await expect(editor).toHaveValue(solution);
 await editor.fill('pass');
 await goto('#challenges');
 await expect(page.locator('.challenge-passed')).toHaveCount(0);

 await goto('#lesson/loops/learn');
 await page.locator('.lesson-tabs').getByRole('link',{name:'Practice',exact:true}).click();
 await expect(page.locator('.practice-picker option')).toHaveCount(4);
 await page.getByRole('combobox',{name:'Practice task',exact:true}).selectOption('2');
 await expect(page.locator('.assignment-brief h2')).toHaveText('Print Five Squares');
 const squares=challenges.find(c=>c.id==='squares');
 await editor.fill(squares.solution);
 await page.getByRole('button',{name:'Check my work',exact:true}).click();
 await expect(page.locator('.check-results')).toContainText('All code checks passed',{timeout:30000});
 await page.screenshot({path:'test-results/lesson-practice-integrated.png',fullPage:true});
 await page.getByRole('combobox',{name:'Practice task',exact:true}).selectOption('3');
 await expect(page.locator('.assignment-brief h2')).toHaveText('Fix the Repeating Total');
 await page.goBack();
 await expect(page.locator('.assignment-brief h2')).toHaveText('Print Five Squares');
 await expect(editor).toHaveValue(squares.solution);
 await page.reload({waitUntil:'networkidle'});
 await expect(editor).toHaveValue(squares.solution);
 await page.getByRole('link',{name:'Continue to project',exact:true}).click();
 await expect(page.locator('main h1')).toHaveText('Repeat an Instruction');
 await expect(page.locator('.activity-heading h2')).toHaveText('A Score Report');
 await editor.fill('points = [3, 5, 2]\ntotal = 0\nfor point in points:\n    total = total + point\n    print(total)\nprint(total)');
 await run('3\n8\n10\n10\n');
 await page.screenshot({path:'test-results/lesson-project-integrated.png',fullPage:true});
 await page.getByRole('link',{name:'Open homework',exact:true}).click();
 await expect(page.locator('main h1')).toHaveText('Repeat an Instruction');
 await expect(page.locator('.lesson-tabs a[aria-current=page]')).toHaveAttribute('href','#lesson/loops/homework');
 await page.locator('.lesson-tabs').getByRole('link',{name:'Project',exact:true}).click();
 await expect(editor).toHaveValue(/points = \[3, 5, 2\]/);
 await expect(page.locator('.site-header nav a')).toHaveText(['Courses','Playground','Word list']);
 console.log('Saved programs, duplication, starter copies, downloads, lesson experiments, project notes, and extra-challenge feedback passed.');

 // A saved course from before these features keeps its code and completion.
 const legacy=await browser.newContext();
 const legacyPage=await legacy.newPage();
 await legacyPage.addInitScript(()=>{if(!localStorage.getItem('python-basics-work-v1'))localStorage.setItem('python-basics-work-v1',JSON.stringify({version:1,tasks:{'print:p1':{code:'print("My saved lesson")',passed:true}},quizzes:{print:0},reflections:{print:'My explanation'},reviews:{print:[true,true]},large:false}))});
 await legacyPage.goto('http://127.0.0.1:5282/#playground',{waitUntil:'networkidle'});
 await expect(legacyPage.getByLabel('Program name',{exact:true})).toHaveValue('My first program');
 const saved=await legacyPage.evaluate(()=>JSON.parse(localStorage.getItem('python-basics-work-v1')));
 expect(saved.tasks['print:p1']).toEqual({code:'print("My saved lesson")',passed:true});
 expect(saved.reflections.print).toBe('My explanation');
 await legacy.close();

 const routes=['#build','#playground','#lesson/numbers/project','#lesson/classes/practice/plant','#lesson/lists/create'];
 for(const hash of routes){
  await goto(hash);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),hash).toEqual([]);
 }
 for(const width of [360,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  for(const hash of [...routes,'#challenges']){
   await goto(hash);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${width} ${hash}`).toBeLessThanOrEqual(width);
  }
 }
 await page.setViewportSize({width:390,height:844});
 await goto('#playground');
 await page.getByRole('button',{name:'Larger text',exact:true}).click();
 for(const hash of routes){
  await goto(hash);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth),`large text ${hash}`).toBeLessThanOrEqual(390);
 }
 await goto('#playground');
 await page.screenshot({path:'test-results/playground-mobile.png',fullPage:true});
 await editor.focus();await page.keyboard.press('Escape');await page.keyboard.press('Tab');
 expect(await editor.evaluate(node=>node===document.activeElement)).toBe(false);
 await page.getByRole('button',{name:'Larger text',exact:true}).click();
 await page.setViewportSize({width:1440,height:1000});
 console.log('Old saved work, new-page accessibility, five screen widths, larger text, and editor keyboard navigation passed.');
}
