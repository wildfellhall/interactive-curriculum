import {expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {slideContent,slideTypes} from '../src/lesson-slides.js';
import {lessons} from '../src/curriculum.js';

export async function chooseSlide(page,id){
 await page.getByRole('combobox',{name:'Go to a slide',exact:true}).selectOption(id);
 await expect(page.locator('.slide-body')).toHaveClass(new RegExp(`slide-${id}(?: |$)`));
}
export async function verifySlidePython(page){
 for(const lesson of lessons){
  const content=slideContent[lesson.id],prediction=content.prediction;
  const result=await page.evaluate(request=>window.testRun(request),{code:prediction.code,input:prediction.input||'',checks:[]});
  expect(result.error,lesson.id+' prediction').toBeNull();
  expect(result.output,lesson.id+' predicted output matches Python').toBe(prediction.expected);
  expect(prediction.choices[prediction.correct],lesson.id+' correct option').toBe(result.output.trimEnd());
  const walkthrough=await page.evaluate(request=>window.testRun(request),{code:content.walk.map(line=>line[0]).join('\n'),input:lesson.id==='numbers'?'6':'',checks:[]});
  expect(walkthrough.error,lesson.id+' walkthrough is valid Python').toBeNull();
  for(const kind of ['build','repair']){
   const task=content[kind];
   const reference=await page.evaluate(request=>window.testRun(request),{code:task.solution,input:task.input,checks:task.checks});
   expect(reference.error,`${lesson.id} ${kind}`).toBeNull();
   expect(reference.checks.every(c=>c.passed),JSON.stringify({id:lesson.id,kind,checks:reference.checks})).toBe(true);
   const incomplete=await page.evaluate(request=>window.testRun(request),{code:task.starter,input:task.input,checks:task.checks});
   expect(!incomplete.error&&incomplete.checks.length>0&&incomplete.checks.every(c=>c.passed),`${lesson.id} ${kind} starter must not pass`).toBe(false);
   const blank=await page.evaluate(request=>window.testRun(request),{code:'pass',input:task.input,checks:task.checks});
   expect(blank.checks.every(c=>c.passed),`${lesson.id} ${kind} blank must fail`).toBe(false);
  }
 }
 console.log(`Slideshow Python: ${lessons.length} predictions, ${lessons.length} walkthroughs, and ${lessons.length*2} coding/debugging solutions passed; unfinished and blank programs were rejected.`);
}

export async function verifySlides(page,browser){
 const goto=async hash=>page.goto('http://127.0.0.1:5282/'+hash,{waitUntil:'networkidle'});
 const deck=page.locator('.lesson-slideshow');
 const editor=page.getByRole('textbox',{name:'Python code',exact:true});
 await goto('#lesson/print/learn');
 await chooseSlide(page,'idea');
 await expect(page.getByRole('button',{name:'Previous slide',exact:true})).toBeDisabled();
 await expect(page.locator('.deck-toolbar option')).toHaveCount(10);
 await page.getByRole('button',{name:'The text value: "Hello!"',exact:true}).click();
 await expect(page.locator('.syntax-explanation')).toContainText('start and end of the string');
 await page.screenshot({path:'test-results/slideshow-idea-desktop.png',fullPage:true});
 await deck.focus();await page.keyboard.press('ArrowRight');
 await expect(page.locator('.deck-position')).toHaveText('Slide 2 of 10');
 await page.getByRole('button',{name:'Line 3: print("")',exact:true}).click();
 await expect(page.locator('.line-explanation')).toContainText('An empty string');
 await page.getByRole('button',{name:'Next slide',exact:true}).click();
 await page.getByLabel('Change the message',{exact:true}).fill('Welcome to the club');
 await expect(page.locator('.result-box')).toContainText('Welcome to the club');
 await page.getByRole('button',{name:'Next slide',exact:true}).click();
 await page.locator('.quiz-options button').nth(1).click();
 await expect(page.locator('.quiz-feedback')).toContainText('Try again.');
 await page.locator('.quiz-options button').nth(0).click();
 await expect(page.locator('.quiz-feedback')).toContainText('Correct.');
 await page.reload({waitUntil:'networkidle'});
 await expect(page.locator('.deck-position')).toHaveText('Slide 4 of 10');
 await expect(page.locator('.quiz-options button').nth(0)).toHaveAttribute('aria-pressed','true');
 await chooseSlide(page,'run');
 await editor.fill('print("My saved example")');
 await editor.focus();await page.keyboard.press('ArrowLeft');
 await expect(page.getByRole('combobox',{name:'Go to a slide',exact:true})).toHaveValue('run');
 await page.getByRole('button',{name:'Run code',exact:true}).click();
 await expect(page.locator('.output')).toHaveText('My saved example\n',{timeout:30000});
 await chooseSlide(page,'build');
 await editor.fill(slideContent.print.build.solution);
 await page.getByRole('button',{name:'Check my work',exact:true}).click();
 await expect(page.locator('.check-results')).toContainText('All code checks passed',{timeout:30000});
 await chooseSlide(page,'repair');
 await expect(editor).toHaveValue(slideContent.print.repair.starter);
 await page.getByRole('button',{name:'Run code',exact:true}).click();
 await expect(page.locator('.code-error')).toContainText('SyntaxError',{timeout:30000});
 await editor.fill(slideContent.print.repair.solution);
 await page.getByRole('button',{name:'Check my work',exact:true}).click();
 await expect(page.locator('.check-results')).toContainText('All code checks passed',{timeout:30000});
 await chooseSlide(page,'run');
 await expect(editor).toHaveValue('print("My saved example")');
 await chooseSlide(page,'build');
 await expect(editor).toHaveValue(slideContent.print.build.solution);
 await page.reload({waitUntil:'networkidle'});
 await expect(page.getByRole('combobox',{name:'Go to a slide',exact:true})).toHaveValue('build');
 await expect(editor).toHaveValue(slideContent.print.build.solution);
 await chooseSlide(page,'review');
 await page.locator('.quiz-options button').nth(0).click();
 await expect(page.locator('.quiz-feedback')).toContainText('Correct.');
 await page.getByRole('link',{name:'Go to practice',exact:true}).click();
 await expect(page.locator('.lesson-tabs a[aria-current=page]')).toHaveAttribute('href','#lesson/print/practice');
 await page.locator('.lesson-tabs').getByRole('link',{name:/Learn/}).click();
 await expect(page.locator('.deck-position')).toHaveText('Slide 10 of 10');
 console.log('Slide controls, arrow keys, editable diagrams, prediction feedback, resumed position, independent drafts, debugging, and lesson progression passed.');

 // Existing example code and completion remain available when upgrading older saved work.
 const legacy=await browser.newContext();const oldPage=await legacy.newPage();
 await oldPage.addInitScript(()=>{if(!localStorage.getItem('python-basics-work-v1'))localStorage.setItem('python-basics-work-v1',JSON.stringify({version:1,tasks:{'print:example':{code:'print("Earlier work")',input:''}},quizzes:{print:0}}))});
 await oldPage.goto('http://127.0.0.1:5282/#lesson/print/learn',{waitUntil:'networkidle'});
 await chooseSlide(oldPage,'run');
 await expect(oldPage.getByRole('textbox',{name:'Python code',exact:true})).toHaveValue('print("Earlier work")');
 await chooseSlide(oldPage,'review');
 await expect(oldPage.locator('.quiz-feedback')).toContainText('Correct.');
 await legacy.close();

 // Render every slide of every lesson; all Python examples are checked above.
 for(const lesson of lessons){
  await goto(`#lesson/${lesson.id}/learn`);
  for(const slide of slideTypes){
   await chooseSlide(page,slide.id);
   await expect(page.locator('.slide-heading h2')).toBeVisible();
   await expect(page.locator('.slide-body')).not.toContainText('undefined');
   if(['run','build','repair'].includes(slide.id))await expect(editor).toHaveCount(1);
  }
 }
 await goto('#lesson/print/learn');
 for(const slide of slideTypes){
  await chooseSlide(page,slide.id);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),slide.id).toEqual([]);
 }
 await goto('#lesson/classes/learn');
 await chooseSlide(page,'read');
 await page.getByRole('button',{name:/Line 3:/}).click();
 await page.screenshot({path:'test-results/slideshow-code-desktop.png',fullPage:true});
 for(const width of [360,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  for(const slide of slideTypes){
   await chooseSlide(page,slide.id);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${width} ${slide.id}`).toBeLessThanOrEqual(width);
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Larger text',exact:true}).click();
 for(const slide of slideTypes){
  await chooseSlide(page,slide.id);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth),`larger text ${slide.id}`).toBeLessThanOrEqual(390);
 }
 await chooseSlide(page,'read');
 await page.screenshot({path:'test-results/slideshow-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Larger text',exact:true}).click();
 await page.setViewportSize({width:1440,height:1000});
 console.log(`All ${lessons.length*10} beginner slides, old saved examples, accessibility, five screen widths, and larger text passed.`);
}
