/* Character Bookshelf World Maps — pure, dependency-free data helpers.
   Schema 1 is additive and does not alter any existing Bookshelf files. */
export const SCHEMA = 1;
export const MAX_OBJECTS = 15000;
const clone = (x) => structuredClone(x);
export const id = () => (globalThis.crypto?.randomUUID?.() || `wm-${Date.now()}-${Math.random().toString(36).slice(2)}`);
export const isMap = x => x && x.schema===SCHEMA && typeof x.id==='string' && Array.isArray(x.objects) && x.canvas && Number.isFinite(x.canvas.width) && Number.isFinite(x.canvas.height);
export function newMap({title='Untitled Map',scope='novel',owner='Unassigned',width=1600,height=1000,background='parchment',baseImage=null,outline='none'}={}){
 const mid=id(), now=new Date().toISOString();
 const map={schema:SCHEMA,id:mid,familyId:mid,title:String(title).slice(0,150),scope,owner,createdAt:now,updatedAt:now,canvas:{width,height,background,grid:false},baseImage,objects:[],combinedOf:null,importedFrom:[],originId:null};
 if(outline!=='none') map.objects.push({id:id(),kind:'shape',template:outline,x:width/2,y:height/2,w:width*.48,h:height*.50,fill:'#638a77',stroke:'#183a43',strokeWidth:3,rotation:0,source:null});
 return map;
}
export function duplicateMap(map,{scope=map.scope,owner=map.owner,title=`${map.title} (Copy)`,combined=false}={}){
 if(!isMap(map))throw new Error('Invalid source map');
 const m=clone(map),oldid=m.id,now=new Date().toISOString();
 m.id=id();m.scope=scope;m.owner=owner;m.title=title;m.createdAt=now;m.updatedAt=now;m.originId=oldid;
 m.combinedOf=combined?oldid:null;m.importedFrom=[];
 m.objects=m.objects.map(o=>({...o,id:id(),source:combined?{mapId:oldid,objectId:o.id}:null}));
 if(m.baseImage) m.baseImage={...m.baseImage,storageFile:null,unlinked:true}; // caller may copy image into own storage
 return m;
}
export function compatible(a,b){
 if(!isMap(a)||!isMap(b))return false;
 if(a.familyId!==b.familyId || a.canvas.width!==b.canvas.width || a.canvas.height!==b.canvas.height) return false;
 if(Boolean(a.baseImage)!==Boolean(b.baseImage))return false;
 return !a.baseImage || a.baseImage.sha256===b.baseImage.sha256;
}
export function combine(target,source,selectedIds=null){
 if(!compatible(target,source))throw new Error('Map bases do not match. Copy from a common map first.');
 const choices=new Set(selectedIds||source.objects.map(o=>o.id));
 const records=new Set((target.importedFrom||[]).map(r=>r.mapId+':'+r.objectId));
 const next=clone(target);let added=0,skipped=0;
 for(const obj of source.objects){
  if(!choices.has(obj.id))continue;
  const original=obj.source && obj.source.mapId && obj.source.objectId ? obj.source : {mapId:source.id,objectId:obj.id};
  const key=original.mapId+':'+original.objectId;
  if(records.has(key) || next.objects.some(o=>o.source?.mapId===original.mapId && o.source?.objectId===original.objectId)){skipped++;continue;}
  if(next.objects.length>=MAX_OBJECTS)throw new Error(`Map object safety limit of ${MAX_OBJECTS} reached`);
  next.objects.push({...clone(obj),id:id(),source:original});
  next.importedFrom.push(original);records.add(key);added++;
 }
 next.updatedAt=new Date().toISOString();
 return {map:next,added,skipped};
}
export function recoverMap(map){
 if(!isMap(map))throw new Error('Invalid recovery map');
 const m=clone(map);
 if(m.baseImage)m.baseImage={...m.baseImage,storageFile:null,unlinked:true};
 return m;
}
export function stripImageBytes(map){
 const m=recoverMap(map);
 if(m.baseImage){delete m.baseImage.bytes;delete m.baseImage.dataUrl;delete m.baseImage.blob;}
 return m;
}
export function validate(map){
 if(!isMap(map))throw new Error('Invalid or unsupported world map format');
 if(map.objects.length>MAX_OBJECTS)throw new Error('Too many objects');
 if(map.canvas.width>12000||map.canvas.height>12000||map.canvas.width<100||map.canvas.height<100)throw new Error('Unsupported canvas dimensions');
 if(map.objects.some(x=>typeof x.id!=='string'||!['shape','stroke','text','stamp'].includes(x.kind)))throw new Error('Invalid annotation object');
 return true;
}
export const STAMPS=['tree','forest-small','forest-large','house','village','castle','mountain','mountains','water','bridge','ruins','cave','camp'];
export const SHAPES=['none','circle','rectangle','triangle','landmass','islands'];
