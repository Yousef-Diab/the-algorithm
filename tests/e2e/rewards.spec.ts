import { test, expect } from '@playwright/test';
test('leaderboard requires membership and does not render player rows to guests', async ({page}) => {
  await page.goto('/leaderboard');
  await expect(page.getByRole('heading',{name:'Member leaderboard',exact:true})).toBeVisible();
  await expect(page.getByText('A little friendly competition.',{exact:true})).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
});
test('the production lesson exposes a working optional focus timer', async ({page}) => {
  await page.goto('/lesson/m1-01');
  await page.getByRole('button',{name:'5 min',exact:true}).click();
  await page.getByRole('button',{name:'Start focus',exact:true}).click();
  await expect(page.getByRole('timer')).toHaveText(/04:5\d|05:00/);
  await page.getByRole('region',{name:'Focus session',exact:true}).getByRole('button',{name:'Pause',exact:true}).click();
  await page.reload();
  await expect(page.getByRole('region',{name:'Focus session',exact:true}).getByRole('button',{name:'Resume',exact:true})).toBeVisible();
});
