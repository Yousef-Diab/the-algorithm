import { test, expect } from '@playwright/test';
test.beforeEach(async ({page}) => {
  await page.route('**/api/quiz/fixture',route=>route.fulfill({json:{questions:[
    {id:'q1',q:'First question',o:['A','B','C','D'],a:0,e:'First explanation'},
    {id:'q2',q:'Second question',o:['E','F','G','H'],a:0,e:'Second explanation'},
  ]}}));
  await page.goto('/');
});
test('timer pauses, survives reload, expires gently and extends', async ({page}) => {
  await page.clock.install();
  await page.getByRole('button',{name:'5 min',exact:true}).click();
  await page.getByRole('button',{name:'Start focus',exact:true}).click();
  await expect(page.getByRole('timer')).toHaveText('05:00');
  await page.screenshot({path:'test-results/rewards-desktop.png',fullPage:true});
  await page.clock.fastForward(60000);
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  await expect(page.getByRole('timer')).toHaveText('04:00');
  await page.reload();
  await expect(page.getByRole('timer')).toHaveText('04:00');
  await page.getByRole('button',{name:'Resume',exact:true}).click();
  await page.clock.fastForward(240000);
  await expect(page.getByText('Time to finish up.')).toBeVisible();
  await page.getByRole('button',{name:'Add 5 minutes',exact:true}).click();
  await expect(page.getByRole('timer')).toHaveText('05:00');
});
test('the final saved answer awards XP automatically and failures can be retried', async ({page}) => {
  await page.evaluate(()=>sessionStorage.setItem('fail-answer','1'));
  await page.getByRole('button',{name:'A',exact:true}).click();
  await expect(page.getByText(/answer.*not saved/i)).toBeVisible();
  await page.evaluate(()=>sessionStorage.removeItem('fail-answer'));
  await page.getByRole('button',{name:'Retry saving',exact:true}).click();
  await page.evaluate(()=>sessionStorage.setItem('fail-claim','1'));
  await page.getByRole('button',{name:'E',exact:true}).click();
  await expect(page.getByText(/could not finish/i)).toBeVisible();
  await page.evaluate(()=>sessionStorage.removeItem('fail-claim'));
  await page.getByRole('button',{name:'Retry XP',exact:true}).click();
  await expect(page.getByText('+40 XP', {exact:true})).toBeVisible();
  await expect(page.getByText('Perfect first attempt · Secret +5 XP', {exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Retry XP',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Finish checkpoint',exact:true})).toHaveCount(0);
});
test('profile save errors remain visible and mobile layout fits', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'test-results/rewards-mobile.png',fullPage:true});
  await page.evaluate(()=>sessionStorage.setItem('fail-profile','1'));
  await page.getByRole('button',{name:'Save profile',exact:true}).click();
  await expect(page.getByText(/could not save/i)).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
test('a compact timer stays available while reading further down', async ({page}) => {
  await page.getByRole('button',{name:'Start focus',exact:true}).click();
  await page.getByRole('heading',{name:'Leaderboard',exact:true}).scrollIntoViewIfNeeded();
  const dock=page.getByRole('region',{name:'Active focus timer'});
  await expect(dock).toBeVisible();
  await dock.getByRole('button',{name:'Pause',exact:true}).click();
  await expect(dock.getByRole('button',{name:'Resume',exact:true})).toBeVisible();
});
