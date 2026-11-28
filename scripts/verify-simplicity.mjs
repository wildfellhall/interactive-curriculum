import {expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {courses,referenceCourse,getProject,allLessonById} from '../src/course-catalog.js';
import {chooseSlide} from './verify-slides.mjs';

export async function verifySimplicity(browser){
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page=await context.newPage();page.setDefaultTimeout(15000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const goto=async hash=>page.goto('http://127.0.0.1:5282/'+hash,{waitUntil:'networkidle'});
 const open=async selector=>{const details=page.locator(selector);if(!(await details.evaluate(el=>el.open)))await details.locator(':scope > summary').click()};
 const audit=async label=>{const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),label).toEqual([])};
 try{
  for(const course of [...Object.values(courses),referenceCourse]){
   await goto(course.href);
   await expect(page.locator('.part-toggle[aria-expanded=true]')).toHaveCount(1);
   for(const [index,section] of course.sections.entries()){
    const toggle=page.locator('.part-toggle').nth(index);
    if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();
    await expect(page.locator('.part-toggle[aria-expanded=true]')).toHaveCount(1);
    await expect(page.locator('.lesson-links a:visible')).toHaveCount(section.lessons.length);
    for(const id of section.lessons){const lesson=allLessonById[id],link=page.locator(`.lesson-links a[href="#lesson/${id}/learn"]`);await expect(link).toBeVisible();await expect(link).toContainText(lesson.title);await expect(link).toContainText(lesson.topic);await expect(link).toContainText(getProject(lesson).title)}
   }
   await open('.course-guide');await expect(page.locator('.how-to-use')).toBeVisible();await expect(page.locator('.intro-picture')).toBeVisible();
   if(course.id==='intermediate'){await open('.reference-link');await expect(page.getByRole('link',{name:'Open Python reference',exact:true})).toBeVisible()}
   await audit(course.id+' course disclosures');
  }
  await goto('#courses');for(const details of await page.locator('.course-outline').all()){await details.locator('summary').click();await expect(details.locator('li')).toHaveCount(4)}await audit('course outlines');

  await goto('#lesson/types/learn');await chooseSlide(page,'run');
  const editor=page.getByRole('textbox',{name:'Python code',exact:true});
  await expect(page.getByRole('button',{name:'Save .py',exact:true})).toBeHidden();
  await page.locator('.code-tools > summary').focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('button',{name:'Save .py',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Open a copy in Playground',exact:true})).toBeVisible();
  await expect(page.locator('.editor-help')).toBeVisible();
  await editor.fill('score = 7\nprint(score)');
  await page.getByRole('button',{name:'Reset',exact:true}).click();await expect(editor).toHaveValue(allLessonById.types.code);
  await page.getByRole('button',{name:'Undo reset',exact:true}).click();await expect(editor).toHaveValue('score = 7\nprint(score)');
  await page.getByRole('button',{name:'Run code',exact:true}).click();await expect(page.locator('.output')).toHaveText('7\n',{timeout:30000});
  await expect(page.locator('.value-cards')).toBeHidden();await open('.values-disclosure');await expect(page.locator('.value-cards')).toContainText('score');
  await page.getByRole('button',{name:'Watch each step',exact:true}).click();await expect(page.locator('.values-disclosure')).toHaveAttribute('open','');await expect(page.locator('.trace')).toBeVisible();
  await page.getByRole('button',{name:'Edit code',exact:true}).click();await open('.input-box');await expect(page.getByLabel('Answer while the program runs',{exact:true})).toBeVisible();await open('.starting-files');
  await audit('expanded editor tools');
  await page.screenshot({path:'test-results/simple-tools-open.png',fullPage:true});

  await goto('#lesson/app-guess/project');await expect(page.getByLabel('Plan Your Idea',{exact:true})).toBeHidden();
  await open('.project-planning');await page.getByLabel('Plan Your Idea',{exact:true}).fill('Add a choice of difficulty.');
  await open('.project-review-panel');await expect(page.locator('.project-review input')).toHaveCount(allLessonById['app-guess'].project.tests.length);
  await page.getByLabel('What did you change or discover?',{exact:true}).fill('Invalid guesses should not use a turn.');
  await page.reload({waitUntil:'networkidle'});await open('.project-planning');await open('.project-review-panel');
  await expect(page.getByLabel('Plan Your Idea',{exact:true})).toHaveValue('Add a choice of difficulty.');await expect(page.getByLabel('What did you change or discover?',{exact:true})).toHaveValue('Invalid guesses should not use a turn.');
  await audit('expanded project notes');

  await goto('#lesson/types/homework');await expect(page.getByLabel('Explain Your Code',{exact:true})).toBeHidden();await open('.homework-completion');await expect(page.getByLabel('Explain Your Code',{exact:true})).toBeVisible();
  await page.locator('.homework-completion > summary').click();await editor.fill(allLessonById.types.homework.solution);await page.getByRole('button',{name:'Check my work',exact:true}).click();await expect(page.locator('.check-results')).toContainText('All code checks passed',{timeout:30000});await expect(page.getByLabel('Explain Your Code',{exact:true})).toBeVisible();
  await audit('homework follow-up');
  for(const width of [360,390,768,1024,1440]){
   await page.setViewportSize({width,height:900});
   for(const [route,panels] of [['#lesson/types/learn',['.code-tools','.input-box','.starting-files']],['#lesson/app-guess/project',['.project-planning','.project-review-panel']],['#intermediate',['.course-guide','.reference-link']]]){
    await goto(route);if(route.endsWith('/learn'))await chooseSlide(page,'run');for(const panel of panels)await open(panel);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${width} expanded ${route}`).toBeLessThanOrEqual(width);
   }
  }
  await page.setViewportSize({width:390,height:844});await goto('#lesson/types/learn');await chooseSlide(page,'run');await open('.code-tools');await open('.input-box');await open('.starting-files');await page.getByRole('button',{name:'Larger text',exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);await audit('expanded mobile tools with larger text');
  await page.screenshot({path:'test-results/simple-tools-mobile.png',fullPage:true});
  expect(errors).toEqual([]);
  console.log('Simplified navigation: every lesson and project remains reachable. Expandable tools, reset/undo, value inspection, planning, homework, saved notes, keyboard controls, accessibility, and expanded mobile layouts passed.');
 }finally{await context.close()}
}
