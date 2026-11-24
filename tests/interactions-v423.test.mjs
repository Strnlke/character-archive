import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {copyAnnotation,resizeAnnotation} from '../world-maps-interactions-v423.mjs';
const dir=resolve(dirname(fileURLToPath(import.meta.url)),'..');
test('all release JavaScript files parse, and module entry point imports',()=>{
 for(const [file,module] of [['app.js',false],['series-v41.js',false],['features-v412.js',false],['world-maps.js',true],['world-maps-core.mjs',true],['world-maps-interactions-v423.mjs',true]]){
  const p=spawnSync(process.execPath,[...(module?['--input-type=module']:[]),'--check'],{input:readFileSync(resolve(dir,file)),encoding:'utf8'});
  assert.equal(p.status,0,`${file}: ${p.stderr}`);
 }
});
test('stamp enlarge then shrink retains position and original size',()=>{
 const o={id:'s1',kind:'stamp',asset:'water',x:243.8,y:128.3,scale:1.5,rotation:30,color:'#456'};
 for(let i=0;i<10;i++){resizeAnnotation(o,'enlarge');resizeAnnotation(o,'shrink')}
 assert.deepEqual({x:o.x,y:o.y,scale:o.scale},{x:243.8,y:128.3,scale:1.5});
});
test('shape and text resize reversibly without shifting center',()=>{
 for(const o of [{kind:'shape',x:1,y:2,w:240,h:120},{kind:'text',x:30,y:90,fontSize:30}]){
  const original=structuredClone(o);resizeAnnotation(o,'enlarge');resizeAnnotation(o,'shrink');assert.deepEqual(o,original);
 }
});
test('duplicate retains properties, creates new independent ID and shifts only position',()=>{
 const o={id:'old',kind:'stamp',asset:'water',x:100,y:120,scale:5,rotation:45,color:'#123456',source:{ref:'remote'}};
 const next=copyAnnotation(o,'new',30);
 assert.equal(next.id,'new');assert.equal(next.asset,o.asset);assert.equal(next.scale,o.scale);assert.equal(next.rotation,o.rotation);assert.equal(next.color,o.color);
 assert.equal(next.x,130);assert.equal(next.y,150);assert.equal(next.source,null);
 next.scale=100;assert.equal(o.scale,5);
});
test('duplicated pencil stroke shifts its path and does not mutate original',()=>{
 const o={id:'p',kind:'stroke',points:[[1,3],[7,9]],width:4,color:'#fff'};
 const n=copyAnnotation(o,'c',14);assert.deepEqual(n.points,[[15,17],[21,23]]);assert.deepEqual(o.points,[[1,3],[7,9]]);
});
test('full-page toolbar exposes Fit, uses navigate by default and has no Select/Pan buttons',()=>{
 const html=readFileSync(resolve(dir,'world-maps.html'),'utf8');
 assert.match(html,/id="fit-map"[^>]*>Fit to Screen/);
 assert.doesNotMatch(html,/data-tool="select"|data-tool="pan"/);
 assert.match(html,/data-tool="navigate"/);
});
test('user facing RAM recovery is displayed in decimal MB',()=>{
 const a=readFileSync(resolve(dir,'app.js'),'utf8'),b=readFileSync(resolve(dir,'features-v412.js'),'utf8');
 assert.match(b,/bytes\/1000000/);assert.ok(b.includes("' MB / '+cap+' MB'"));
 assert.match(a,/RECOVERY_LIMIT\/1000000/);
});
test('bookshelf introduces optional mode toggle and preserves series grouping',()=>{
 const html=readFileSync(resolve(dir,'index.html'),'utf8'),app=readFileSync(resolve(dir,'app.js'),'utf8'),series=readFileSync(resolve(dir,'series-v41.js'),'utf8');
 assert.match(html,/id="bookshelfViewModeBtn"/);assert.match(app,/BOOKSHELF_VIEW_PREF_PREFIX/);assert.match(series,/renderShelfSeries\(capacity=5\)/);
 assert.match(app,/renderShelfSeries\(geometry.capacity\)/);
});
