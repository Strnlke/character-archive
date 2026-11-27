import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {newMap} from '../world-maps-core.mjs';
import {discoverSavedMaps,discoverSavedMapJSON,prepareIndependentMap,verifySourceImage} from '../world-maps-import-v427.mjs';
const html=readFileSync(new URL('../world-maps.html',import.meta.url),'utf8');
const script=readFileSync(new URL('../world-maps.js',import.meta.url),'utf8');
class FakeFile {constructor(name,body){this.name=name;this.kind='file';this.data=body;this.size=new TextEncoder().encode(body).length;}async text(){return this.data}async getFile(){return this}}
class FakeDir {constructor(name){this.kind='directory';this.name=name;this.items=new Map()}add(x){this.items.set(x.name,x);return x}async getDirectoryHandle(k){const o=this.items.get(k);if(!o||o.kind!=='directory')throw Object.assign(new Error('Missing'),{name:'NotFoundError'});return o}async getFileHandle(k){const o=this.items.get(k);if(!o||o.kind!=='file')throw Object.assign(new Error('Missing'),{name:'NotFoundError'});return {getFile:async()=>o}}async *entries(){yield* this.items.entries()}}
test('discovers original map JSON in a separate writer folder without writing',async()=>{
 const writer=new FakeDir('writer');const folder=writer.add(new FakeDir('world-maps'));const maps=folder.add(new FakeDir('maps'));
 const source=newMap({title:'Old World',owner:'original'});source.objects=[{id:'stamp-old',kind:'stamp',asset:'tree',x:10,y:22}];
 maps.add(new FakeFile(`${source.id}.json`,JSON.stringify(source)));
 const result=await discoverSavedMaps(writer);assert.equal(result.length,1);assert.equal(result[0].map.title,'Old World');assert.equal(result[0].map.objects.length,1);
 assert.equal(result[0].imageFile,null);assert.equal(writer.items.size,1);
 const copied=prepareIndependentMap(source,{title:'Old World (Imported)',scope:'series',owner:'new-series'});
 assert.notEqual(copied.id,source.id);assert.notEqual(copied.objects[0].id,source.objects[0].id);
 assert.equal(copied.objects[0].asset,source.objects[0].asset);assert.equal(copied.owner,'new-series');assert.equal(source.owner,'original');
});
test('standalone JSON import keeps image unlinked without its source folder',async()=>{
 const source=newMap({title:'Map with picture'});source.baseImage={filename:'my-map.png',sha256:'f'.repeat(64),storageFile:'stored.png',unlinked:false};
 const result=await discoverSavedMapJSON(new FakeFile('map.json',JSON.stringify(source)));
 const copied=prepareIndependentMap(result[0].map,{title:'Imported',scope:'novel',owner:'new-book'});
 assert.equal(result[0].imageFile,null);assert.equal(copied.baseImage.unlinked,true);assert.equal(copied.baseImage.storageFile,null);
});
test('invalid file, fake image hash and unsafe image paths are rejected',async()=>{
 await assert.rejects(()=>discoverSavedMapJSON(new FakeFile('bad.json','{}')),/Invalid/);
 const writer=new FakeDir('writer');const folder=writer.add(new FakeDir('world-maps'));const maps=folder.add(new FakeDir('maps'));
 const src=newMap({title:'Bad'});src.baseImage={storageFile:'../evil.png',unlinked:false};maps.add(new FakeFile(`${src.id}.json`,JSON.stringify(src)));
 await assert.rejects(()=>discoverSavedMaps(writer),/Unsafe/);
});
test('UI exposes separately labeled saved-map import and source-folder/JSON selection',()=>{
 for(const id of ['import-saved-map','import-saved-map-menu','dlg-import-map','choose-source-map-folder','choose-source-map-json','import-map-choice','import-map-confirm'])assert.match(html,new RegExp(`id="${id}"`));
 assert.match(script,/await verifySourceImage\(original,source.imageFile\)/);
 assert.match(script,/await saveNew\(map,srcImage,original.baseImage\?\.filename\|\|null\)/);
});

test('real SHA-256 rejects tampered original images before import',async()=>{
 const original=new TextEncoder().encode('original source image bytes');
 const savedHash=createHash('sha256').update(original).digest('hex');
 const map=newMap({title:'Image-backed'});map.baseImage={sha256:savedHash,storageFile:'map.png',unlinked:false};
 const file={size:original.length,arrayBuffer:async()=>original.buffer};
 assert.equal(await verifySourceImage(map,file),file);
 const bad=new Uint8Array(original);bad[0]=99;await assert.rejects(()=>verifySourceImage(map,{size:bad.length,arrayBuffer:async()=>bad.buffer}),/fingerprint does not match/);
});
