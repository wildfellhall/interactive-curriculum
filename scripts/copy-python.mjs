import {cp,mkdir} from 'node:fs/promises';
await mkdir('public/pyodide',{recursive:true});
await cp('node_modules/pyodide','public/pyodide',{recursive:true});
console.log('Local Python runtime ready.');
