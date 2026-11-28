import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
const headers={'Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Embedder-Policy':'require-corp'};
export default defineConfig({plugins:[react()],server:{headers,host:'127.0.0.1',port:5282,strictPort:true},preview:{headers,host:'127.0.0.1',port:5282,strictPort:true}});
