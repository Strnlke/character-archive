import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
test('World Maps entry point parses AS AN ES MODULE (regression v4.2.1)',()=>{
 const r=spawnSync(process.execPath,['--input-type=module','--check'],{input:readFileSync(resolve(root,'world-maps.js')),encoding:'utf8'});
 assert.equal(r.status,0,`${r.stderr||r.stdout}`);
});
test('World Maps is loaded with map core in app HTML',()=>{
 const map=readFileSync(resolve(root,'world-maps.html'),'utf8');
 const host=readFileSync(resolve(root,'index.html'),'utf8');
 assert.match(map,/type="module" src="world-maps\.js\?v=4\.2\.2"/);
 assert.match(host,/maps-host-v420\.js\?v=4\.2\.2/);
 assert.match(map,/World Maps failed to start/);
});
test('No map data schema migration in hotfix',()=>{
 const core=readFileSync(resolve(root,'world-maps-core.mjs'),'utf8');
 assert.match(core,/export const SCHEMA = 1/);
});
