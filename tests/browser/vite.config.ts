import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  root:resolve(__dirname,'fixture'),
  server:{host:'127.0.0.1',port:4318,strictPort:true,fs:{allow:[resolve(__dirname,'../..')]}},
  esbuild:{jsx:'automatic'},
  resolve:{alias:[
    {find:'@/app/actions/rewards',replacement:resolve(__dirname,'fixture/actions.ts')},
    {find:'@/app/actions/progress',replacement:resolve(__dirname,'fixture/progress.ts')},
    {find:'next/link',replacement:resolve(__dirname,'fixture/Link.tsx')},
    {find:'next/navigation',replacement:resolve(__dirname,'fixture/navigation.ts')},
    {find:'@',replacement:resolve(__dirname,'../..')},
  ]},
});
