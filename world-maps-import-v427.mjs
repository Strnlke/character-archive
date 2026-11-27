/* v4.2.7: read-only discovery of editable World Maps from another folder.
   This module NEVER creates, writes, or deletes source files. */
import {SCHEMA,validate,duplicateMap} from './world-maps-core.mjs';
const MAX_MAP_BYTES=16*1024*1024;
const SAFE_FILE=/^[A-Za-z0-9_-]{1,110}\.(?:png|jpg|jpeg|webp)$/i;
const SAFE_MAP_ID=/^[A-Za-z0-9_-]{1,110}$/;
async function getSub(dir,name){try{return await dir.getDirectoryHandle(name)}catch(e){if(e.name==='NotFoundError')return null;throw e}}
async function getOptionalFile(dir,name){try{return await (await dir.getFileHandle(name)).getFile()}catch(e){if(e.name==='NotFoundError')return null;throw e}}
async function readMap(file){
 if(file.size>MAX_MAP_BYTES)throw Error('Map JSON exceeds the 16 MiB import limit');
 const map=JSON.parse(await file.text());validate(map);
 if(!SAFE_MAP_ID.test(map.id))throw Error('Map ID is not a safe filename');
 if(typeof map.title!=='string'||!map.title.trim())throw Error('Map title is missing');
 return map;
}
export async function discoverSavedMaps(selectedDir){
 if(!selectedDir||selectedDir.kind!=='directory')throw Error('Choose a source folder');
 const homes=[selectedDir];
 for(const folder of ['world-maps','Character Bookshelf World Maps']){
  const dir=await getSub(selectedDir,folder);if(dir)homes.push(dir);
 }
 // A user may choose the containing library folder instead of its writer folder.
 for await(const [name,h] of selectedDir.entries()){
  if(h.kind!=='directory'||homes.length>=35)continue;
  const sub=await getSub(h,'world-maps');if(sub)homes.push(sub);
 }
 const entries=[];const seen=new Set();
 for(const home of homes){
  const maps=await getSub(home,'maps');
  const mapFiles=maps|| (home.name==='maps'?home:null);
  if(!mapFiles)continue;
  const images=await getSub(home,'images');
  // Deliberately inspect map JSONs instead of trusting the index's paths.
  for await(const [name,handle] of mapFiles.entries()){
   if(handle.kind!=='file'||!name.endsWith('.json')||!SAFE_MAP_ID.test(name.slice(0,-5)))continue;
   const map=await readMap(await handle.getFile());
   if(name!==map.id+'.json')throw Error('Map filename and stored map ID do not match');
   const key=home.name+'/'+name+'/'+map.updatedAt;
   if(seen.has(key))continue;seen.add(key);
   let imageFile=null;
   if(map.baseImage&&!map.baseImage.unlinked&&map.baseImage.storageFile){
    if(!SAFE_FILE.test(map.baseImage.storageFile))throw Error('Unsafe source-image filename');
    if(images)imageFile=await getOptionalFile(images,map.baseImage.storageFile);
   }
   entries.push({map,imageFile,source:home.name});
   if(entries.length>500)throw Error('Too many maps in folder (500 maximum)');
  }
 }
 if(!entries.length)throw Error('No saved editable maps found. Choose the writer folder, its world-maps folder, or a library containing a writer folder.');
 return entries;
}
export async function discoverSavedMapJSON(file){
 if(!file||file.kind==='directory')throw Error('Choose a map JSON file');
 return [{map:await readMap(file),imageFile:null,source:'Standalone map JSON'}];
}
export function prepareIndependentMap(source,{title,scope,owner}){
 validate(source);
 if(!['novel','series'].includes(scope)||!owner||!String(title).trim())throw Error('Choose a destination and a title');
 const result=duplicateMap(source,{title:String(title).trim().slice(0,150),scope,owner,combined:false});
 // Duplicated map starts with a new ID, independent object IDs, and unlinked image metadata.
 return result;
}
export async function verifySourceImage(map,file){
 if(!map.baseImage||map.baseImage.unlinked||!file)return null;
 if(file.size>64*1024*1024)throw Error('Source image exceeds the 64 MiB safety limit');
 const expected=map.baseImage.sha256;
 if(!/^[0-9a-f]{64}$/i.test(expected||''))throw Error('Source map has no valid image fingerprint');
 const bytes=await file.arrayBuffer();
 const actual=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
 if(actual.toLowerCase()!==expected.toLowerCase())throw Error('Source image fingerprint does not match the saved map. Nothing was imported.');
 return file;
}
