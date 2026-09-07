import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
export default defineConfig({
  testDir: '.', testMatch: 'rewards.spec.ts', timeout:15000,
  use:{baseURL:'http://localhost:4318', viewport:{width:1200,height:900}},
  webServer:{command:'pnpm exec vite --config tests/browser/vite.config.ts',cwd:resolve(__dirname,'../..'),url:'http://localhost:4318',reuseExistingServer:false},
});
