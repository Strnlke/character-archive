import {SCHEMA,id,newMap,duplicateMap,compatible,combine,recoverMap,stripImageBytes,validate,STAMPS,SHAPES} from './world-maps-core.mjs';
/* World Maps: additive map data in current Bookshelf writer folder; no legacy migration. */
const $ = x => document.getElementById(x);
const NS='http://www.w3.org/2000/svg';
const DIR_NAME='Character Bookshelf World Maps';
const INDEX='world-maps-index.json';
let root=null, work=null, current=null, records=[], allMaps=new Map(), savedHashes=new Map();
let dirty=false, busy=false, autosave=null, editVersion=0, imageUrl=null, tool='select', history=[],future=[], draft=null;
let pan={x:0,y:0,w:1600,h:1000}, gesture=null, previewObjects=[], selectedId=null;
let sessionRecovery=new Map();
let attached=null, attachedBridge=null;
function notify(msg,ms=5500){$('message').textContent=msg;$('message').classList.remove('hidden');clearTimeout(notify.t);notify.t=setTimeout(()=>$('message').classList.add('hidden'),ms)}
function status(msg){$('save-status').textContent=msg}
function sanitize(s){return String(s||'').trim().slice(0,150)}
function ext(file){return (file?.name||'').split('.').pop().toLowerCase()}
function fileMime(file){return file?.type || ({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp'}[ext(file)]||'')}
function bgColor(){return {dark:'#18232e',white:'#ffffff',parchment:'#f2e8cd'}[current?.canvas.background]||'#f2e8cd'}
const jsonText=o=>JSON.stringify(o,null,2)+'\n';
async function sha(bytes){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('')}
async function getFile(dir,name,create=false){return dir.getFileHandle(name,{create})}
async function getDir(dir,name){return dir.getDirectoryHandle(name,{create:true})}
async function readText(dir,name){try{return await (await getFile(dir,name)).getFile().then(f=>f.text())}catch(e){if(e.name==='NotFoundError')return null;throw e}}
async function readBytes(dir,name){return (await getFile(dir,name)).getFile()}
async function writeVerified(dir,name,content,known=null){
 const old=await readText(dir,name);
 if(known!==null && await sha(new TextEncoder().encode(old||''))!==known) throw Error(`${name} changed outside this editor. No overwrite was performed.`);
 if(known===null && old!==null) throw Error(`Refusing to overwrite existing file ${name}`);
 const h=await getFile(dir,name,true),w=await h.createWritable();
 await w.write(content);await w.close();
 const bytes=await (await h.getFile()).arrayBuffer();
 const expected=content instanceof Blob?await content.arrayBuffer():typeof content==='string'?new TextEncoder().encode(content):content;
 if(await sha(bytes)!==await sha(expected))throw Error(`Readback verification failed for ${name}`);
 if(attachedBridge)try{await attachedBridge.registerVerifiedMapFile(dir,name,expected)}catch(e){console.warn('RAM recovery registration failed; on-disk map was verified:',e);notify('Map saved, but RAM recovery could not be updated. Export a full writer backup.',9500)}
 return await sha(bytes);
}
async function workspace(){
 if(!('showDirectoryPicker' in window)) throw Error('This requires a Chromium browser with the File System Access API, served over HTTPS or localhost.');
 root=await showDirectoryPicker({mode:'readwrite'});
 work=await getDir(root,DIR_NAME);
 const old=await readText(work,INDEX);
 if(old){let data=JSON.parse(old);if(data.schema!==SCHEMA||!Array.isArray(data.maps))throw Error('Unsupported World Maps index schema');records=data.maps;savedHashes.set(INDEX,await sha(new TextEncoder().encode(old)))}
 else {records=[];savedHashes.delete(INDEX);await writeIndex()}
 allMaps.clear();await refreshList();$('new-map').disabled=false;$('backup-full').disabled=false;
 status(`Connected • ${root.name} • local only`);
 notify('Local folder connected. World Maps data is stored in its own subfolder.');
}
async function connectToBookshelf(){
 attachedBridge=window.parent!==window?window.parent.CBWorldMapsBridge:null;
 if(!attachedBridge)return;
 attached=attachedBridge.getContext();
 root=attached.writerDir;
 work=await getDir(root,'world-maps');
 const old=await readText(work,INDEX);
 if(old){const data=JSON.parse(old);if(data.schema!==SCHEMA||!Array.isArray(data.maps))throw Error('Unsupported World Maps index schema');records=data.maps;savedHashes.set(INDEX,await sha(new TextEncoder().encode(old)))}
 else{records=[];savedHashes.delete(INDEX);await writeIndex()}
 allMaps.clear();await refreshList();$('new-map').disabled=false;$('backup-full').disabled=false;
 $('choose-folder').classList.add('hidden');$('backup-full').textContent='Maps backup ZIP';
 $('filter-scope').value=attached.context.scope;
 setupAttachedOwners();
 $('workspace-owner').textContent=' / '+(attached.context.scope==='series'?(attached.series.find(x=>x.id===attached.context.id)?.name||'Series'):(attached.novels.find(x=>x.id===attached.context.id)?.name||'Novel'));
 status('Connected to '+attached.writerName+' • local folder');
 notify('Maps belong to this writer and are included in regular writer backups.');
}
function ownerOptions(scope){
 if(!attached)return [];
 const c=attached.context;
 if(c.scope==='series'){
  const s=attached.series.find(s=>s.id===c.id);
  if(scope==='series')return s?[{id:s.id,name:s.name}]:[];
  return (s?.bookIds||[]).map(id=>attached.novels.find(n=>n.id===id)).filter(Boolean);
 }
 const n=attached.novels.find(n=>n.id===c.id);
 if(scope==='novel')return n?[n]:[];
 const s=attached.series.find(s=>s.bookIds.includes(c.id));
 return s?[{id:s.id,name:s.name}]:[];
}
function readableOwner(scope,id){return ownerOptions(scope).find(o=>o.id===id)?.name||id}
function chooseAttachedOwner(form){
 if(!attached)return;
 const scope=$(form+'-scope').value;
 const select=$(form+'-owner-select');select.replaceChildren();
 for(const x of ownerOptions(scope)){select.add(new Option(x.name,x.id))}
 select.disabled=!select.options.length;
 const original=$(form+'-owner');original.classList.add('hidden');
 select.classList.remove('hidden');
 if(form==='new'&&scope===attached.context.scope) select.value=attached.context.id;
 if(form==='copy'&&scope===attached.context.scope) select.value=attached.context.id;
}
function setupAttachedOwners(){
 for(const prefix of ['new','copy']){
  const input=$(prefix+'-owner'),select=document.createElement('select');
  select.id=prefix+'-owner-select';select.setAttribute('aria-label','Destination novel or series');select.classList.add('hidden');
  input.required=false;input.insertAdjacentElement('afterend',select);
  $(prefix+'-scope').onchange=()=>chooseAttachedOwner(prefix);
  chooseAttachedOwner(prefix);
 }
 // Book-level editor defaults to book; series editor defaults to series.
 $('new-scope').value=attached.context.scope;chooseAttachedOwner('new');
 $('copy-scope').value=attached.context.scope;chooseAttachedOwner('copy');
}
function currentOwner(form){return attached?$(form+'-owner-select').value:sanitize($(form+'-owner').value)}
function shownOwners(){if(!attached)return null;
 const c=attached.context;if(c.scope==='series'){const s=attached.series.find(x=>x.id===c.id);return new Set([c.id,...(s?.bookIds||[])])}
 const n=attached.novels.find(x=>x.id===c.id);return new Set([c.id,n?.seriesId].filter(Boolean));
}

async function mapDir(){return await getDir(work,'maps')}
async function imgDir(){return await getDir(work,'images')}
async function revDir(){return await getDir(work,'revisions')}
async function writeIndex(){const contents=jsonText({schema:SCHEMA,product:'Character Bookshelf World Maps',maps:records});const h=await writeVerified(work,INDEX,contents,savedHashes.get(INDEX)||null);savedHashes.set(INDEX,h)}
async function loadMap(mid){
 if(allMaps.has(mid))return structuredClone(allMaps.get(mid));
 const dir=await mapDir();const name=`${mid}.json`;const text=await readText(dir,name);
 if(!text)throw Error(`Map file ${name} is missing`);
 const m=JSON.parse(text);validate(m);savedHashes.set(name,await sha(new TextEncoder().encode(text)));allMaps.set(mid,m);
 return structuredClone(m);
}
async function writeMap(m){
 validate(m);const dir=await mapDir(),filename=`${m.id}.json`,old=await readText(dir,filename);
 const known=savedHashes.get(filename)||null;
 const hash=await writeVerified(dir,filename,jsonText(m),known);
 savedHashes.set(filename,hash);allMaps.set(m.id,structuredClone(m));
 const r=records.find(r=>r.id===m.id),summary={id:m.id,title:m.title,scope:m.scope,owner:m.owner,familyId:m.familyId,updatedAt:m.updatedAt,combinedOf:m.combinedOf};
 if(r)Object.assign(r,summary);else records.push(summary);
 try{await writeIndex()}catch(e){notify(`Map data saved, but index update failed: ${e.message}`,9500);throw e}
}
async function saveNow(){
 if(!current||!work||busy||!dirty)return;
 busy=true;clearTimeout(autosave);status('Saving…');const startedVersion=editVersion;
 try {const saving=structuredClone(current);saving.updatedAt=new Date().toISOString();await writeMap(saving);dirty=editVersion!==startedVersion;if(!dirty) current.updatedAt=saving.updatedAt;status(`Saved • ${new Date().toLocaleTimeString()}`);renderList()}
 catch(e){status('SAVE FAILED • Emergency Recovery available');notify(e.message,10000)}finally{busy=false;if(dirty&&editVersion!==startedVersion){clearTimeout(autosave);autosave=setTimeout(saveNow,900)}}
}
function changed(){if(!current)return;editVersion++;dirty=true;sessionRecovery.set(current.id,stripImageBytes(current));if(attachedBridge)void attachedBridge.registerPendingMap(stripImageBytes(current)).catch(e=>console.warn('Could not register unsaved map recovery snapshot',e));$('emergency-save').disabled=false;status('Unsaved changes • RAM snapshot available');clearTimeout(autosave);autosave=setTimeout(saveNow,900);updateMeta()}
function checkpoint(){if(!current)return;history.push(structuredClone(current));if(history.length>35)history.shift();future=[];}
function undo(){if(!history.length||!current)return;future.push(structuredClone(current));current=history.pop();changed();render();}
function redo(){if(!future.length||!current)return;history.push(structuredClone(current));current=future.pop();changed();render();}
function svgEl(name,attrs={},text=null){const e=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))if(v!==null&&v!==undefined)e.setAttribute(k,String(v));if(text!==null)e.textContent=String(text);return e}
function viewState(){return `${pan.x} ${pan.y} ${pan.w} ${pan.h}`}
function fit(){if(!current)return;const rect=$('stage-wrap').getBoundingClientRect();const cw=Math.max(1,rect.width),ch=Math.max(1,rect.height);const ratio=Math.max(current.canvas.width/cw,current.canvas.height/ch);const w=cw*ratio,h=ch*ratio;pan={x:(current.canvas.width-w)/2,y:(current.canvas.height-h)/2,w,h};render()}
function pos(e){const svg=$('stage'),matrix=svg.getScreenCTM();if(matrix){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());return {x:p.x,y:p.y}}const r=svg.getBoundingClientRect();return {x:pan.x+(e.clientX-r.left)/r.width*pan.w,y:pan.y+(e.clientY-r.top)/r.height*pan.h}}
const pathTemplates={landmass:'M -0.50 -0.05 L -0.38 -0.34 L -0.12 -0.29 L 0.02 -0.47 L 0.21 -0.28 L 0.46 -0.30 L 0.49 0.02 L 0.30 0.18 L 0.35 0.37 L 0.04 0.48 L -0.12 0.30 L -0.37 0.44 L -0.50 0.12 Z',islands:'M -0.47 -0.27 L -0.27 -0.43 L -0.06 -0.22 L -0.15 0.03 L -0.38 0.06 Z M 0.14 -0.40 L 0.43 -0.29 L 0.49 0.03 L 0.27 0.14 L 0.12 -0.09 Z M -0.12 0.30 L 0.05 0.12 L 0.31 0.36 L 0.11 0.48 Z'};
function makeShape(obj){const {template,x,y,w,h,fill='#638a77',stroke='#213845',strokeWidth=3,rotation=0}=obj;const g=svgEl('g',{transform:`translate(${x} ${y}) rotate(${rotation}) scale(${w} ${h})`});let s;
 if(template==='circle')s=svgEl('ellipse',{cx:0,cy:0,rx:.5,ry:.5});
 else if(template==='rectangle')s=svgEl('rect',{x:-.5,y:-.5,width:1,height:1});
 else if(template==='triangle')s=svgEl('path',{d:'M 0 -0.5 L 0.5 0.5 L -0.5 0.5 Z'});
 else s=svgEl('path',{d:pathTemplates[template]||pathTemplates.landmass});
 for(const [k,v] of Object.entries({fill,stroke,'stroke-width':strokeWidth,'vector-effect':'non-scaling-stroke'}))s.setAttribute(k,v);g.append(s);return g;
}
/* Understated hybrid cartography: sparse ink outlines, minimal muted fills.
   A forest, village, or range is still a single persistent annotation object. */
function drawTree(g,x,y,s=1,ink='#394c55'){
 const t=svgEl('g',{transform:`translate(${x} ${y}) scale(${s})`,stroke:ink,fill:'none','stroke-width':2.5,'stroke-linecap':'round','stroke-linejoin':'round'});
 t.append(svgEl('path',{d:'M 0 -25 L -10 -9 H -5 L -15 5 H -7 L -18 18 H 18 L 7 5 H 15 L 5 -9 H 10 Z'}));
 t.append(svgEl('path',{d:'M 0 -25 V 27 M -7 11 L 0 16 L 8 10',opacity:'.55','stroke-width':1.4}));g.append(t);
}
function makeStamp(obj){
 const {x=0,y=0,scale=1,rotation=0,asset='tree',color='#394c55'}=obj;
 const ink=color,soft='#84918a';
 const g=svgEl('g',{transform:`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`,'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'});
 const path=(d,width=2.6,stroke=ink,other={})=>g.append(svgEl('path',{d,stroke,'stroke-width':width,fill:'none',...other}));
 if(asset==='tree')drawTree(g,0,0,1,ink);
 else if(asset==='forest-small'||asset==='forest-large'){
  const pts=asset==='forest-small'?[[-22,-8,.78],[2,-18,.9],[25,-6,.76],[-7,17,.85],[19,21,.73]]:[[-48,-24,.72],[-22,-32,.77],[4,-29,.8],[29,-25,.78],[51,-14,.69],[-39,-2,.79],[-14,-9,.89],[17,-6,.85],[41,7,.74],[-52,24,.74],[-26,26,.79],[0,23,.9],[27,28,.8],[53,28,.69]];
  pts.forEach(([a,b,size],i)=>drawTree(g,a,b,size,i%4===0?soft:ink));
 }else if(asset==='mountain'||asset==='mountains'){
  const peaks=asset==='mountain'?[{x:0,s:1}]:[{x:-36,s:.76},{x:0,s:1},{x:37,s:.81}];
  peaks.forEach(({x:a,s:sz})=>{
   const sub=svgEl('g',{transform:`translate(${a} 1) scale(${sz})`,stroke:ink,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'});
   sub.append(svgEl('path',{d:'M -26 24 L -6 -14 L 1 -26 L 29 24','stroke-width':2.7}));
   sub.append(svgEl('path',{d:'M -14 3 L -7 -4 L 0 1 L 9 -14 M 7 -3 L 3 12 M -5 12 L -9 18','stroke-width':1.55,opacity:'.75'}));g.append(sub);
  });
 }else if(asset==='house'||asset==='village'){
  const pts=asset==='village'?[[-25,9,.7],[8,-10,.83],[22,22,.66]]:[[0,0,1]];
  pts.forEach(([a,b,sc])=>{const home=svgEl('g',{transform:`translate(${a} ${b}) scale(${sc})`,stroke:ink,fill:'none','stroke-width':2.5,'stroke-linejoin':'round'});
   home.append(svgEl('path',{d:'M -23 -2 L 0 -21 L 23 -2 M -18 -5 V 20 H 18 V -5 M -6 20 V 4 H 6 V 20'}));g.append(home)});
 }else if(asset==='castle'||asset==='ruins'){
  path('M -27 21 V -4 H -18 V -13 H -7 V -4 H 6 V -13 H 17 V -4 H 27 V 21 Z M -30 21 H 30',2.7);
  path('M -10 21 V 8 Q 0 -1 10 8 V 21 M -19 -7 V -19 H -11 M 12 -19 H 20 V -7',1.9);
  if(asset==='ruins'){path('M -28 -6 L -17 1 M 13 -14 L 24 -23 M 18 20 L 26 13',2);}
 }else if(asset==='water'){
  for(let i=0;i<3;i++)path(`M -32 ${-15+i*15} Q -23 ${-24+i*15} -14 ${-15+i*15} T 4 ${-15+i*15} T 22 ${-15+i*15} T 40 ${-15+i*15}`,2.4);
 }else if(asset==='bridge'){
  path('M -31 19 L -31 3 Q 0 -31 31 3 V 19 M -31 6 Q 0 -15 31 6 M -35 20 H 35',2.6);
  path('M -17 -5 V 13 M 0 -12 V 13 M 17 -5 V 13',1.4);
 }else if(asset==='cave'){
  path('M -30 20 L -21 -8 L -3 -28 L 10 -22 L 30 20 Z',2.8);
  path('M -14 20 Q -16 -8 0 -8 Q 16 -8 14 20',2.8);
  path('M -20 1 L -12 -7 M 18 4 L 25 10',1.5);
 }else if(asset==='camp'){
  path('M -27 20 L 0 -25 L 27 20 Z M 0 -25 V 20 M -27 20 H 27 M -7 20 L 0 0 L 8 20',2.7);
 }
 // Broad invisible hit region: detailed ink lines are intentionally thin but stamps must remain easy to grab or erase.
 const large=['forest-large','mountains'].includes(asset),medium=['forest-small','village'].includes(asset);
 const rx=large?-78:medium?-55:-36, ry=large?-66:medium?-49:-38;
 const rw=large?156:medium?110:72,rh=large?132:medium?100:78;
 g.prepend(svgEl('rect',{x:rx,y:ry,width:rw,height:rh,fill:'transparent',stroke:'none',class:'stamp-hit','pointer-events':'all'}));
 return g;
}
function makeObject(obj,ghost=false){let el;
 if(obj.kind==='shape')el=makeShape(obj);
 if(obj.kind==='stamp')el=makeStamp(obj);
 if(obj.kind==='stroke')el=svgEl('polyline',{points:(obj.points||[]).map(p=>p.join(',')).join(' '),fill:'none',stroke:obj.color||'#263f4b','stroke-width':obj.width||3,'stroke-linecap':'round','stroke-linejoin':'round'});
 if(obj.kind==='text')el=svgEl('text',{x:obj.x,y:obj.y,fill:obj.color||'#263f4b','font-size':obj.fontSize||30,'font-weight':650,'font-family':'sans-serif','dominant-baseline':'middle'},obj.text||'Location');
 if(!el)return null;
 if(ghost){el.setAttribute('opacity','.45');el.setAttribute('stroke-dasharray','7 5');}
 else{el.setAttribute('data-id',obj.id);el.classList.add('editable');if(obj.id===selectedId){el.setAttribute('filter','url(#noop)');el.setAttribute('opacity','.75');}}
 return el;
}
function makeCanvas({annotationsOnly=false,withImage=true,ghosts=true,editorGrid=false}={}){
 const m=current,svg=svgEl('svg',{xmlns:NS,width:m.canvas.width,height:m.canvas.height,viewBox:`0 0 ${m.canvas.width} ${m.canvas.height}`});
 if(!annotationsOnly){svg.append(svgEl('rect',{width:m.canvas.width,height:m.canvas.height,fill:bgColor()}));
  if(withImage&&m.baseImage&&imageUrl)svg.append(svgEl('image',{href:imageUrl,x:0,y:0,width:m.canvas.width,height:m.canvas.height,preserveAspectRatio:'none'}));
  if(editorGrid&&m.canvas.grid&&!m.baseImage){const g=svgEl('g',{stroke:'#63788a','stroke-width':1,opacity:.20});for(let x=0;x<m.canvas.width;x+=100)g.append(svgEl('line',{x1:x,x2:x,y1:0,y2:m.canvas.height}));for(let y=0;y<m.canvas.height;y+=100)g.append(svgEl('line',{y1:y,y2:y,x1:0,x2:m.canvas.width}));svg.append(g)}
 }
 for(const o of m.objects){const e=makeObject(o);if(e)svg.append(e)}
 if(ghosts)for(const o of previewObjects){const e=makeObject(o,true);if(e)svg.append(e)}
 return svg;
}
function render(){const stage=$('stage');stage.replaceChildren();if(!current){stage.classList.add('hidden');$('empty').classList.remove('hidden');return}
 $('empty').classList.add('hidden');stage.classList.remove('hidden');stage.dataset.tool=tool;
 stage.setAttribute('viewBox',viewState());stage.setAttribute('preserveAspectRatio','xMidYMid meet');
 const fragment=makeCanvas({editorGrid:true});while(fragment.firstChild)stage.append(fragment.firstChild);
 $('relink').classList.toggle('hidden',!current.baseImage?.unlinked);
 $('hint').textContent=current.baseImage?.unlinked?`Unlinked • Missing ${current.baseImage.filename||'source image'}. Annotations are displayed; re-link or convert to blank.`:`${current.title} • ${current.objects.length} editable objects • ${tool} mode • Wheel to zoom`;
 updateMeta();
}
function updateMeta(){if(!current){$('map-meta').textContent='No map selected';return}$('map-meta').textContent=`${current.scope} • ${current.owner} • ${current.canvas.width}×${current.canvas.height} • ${current.objects.length} objects${dirty?' • Unsaved':''}`}
function renderList(){
 const list=$('maps-list');list.replaceChildren();const filter=$('filter-scope').value,allowed=shownOwners();
 const entries=records.filter(x=>(!allowed||allowed.has(x.owner))&&(filter==='all'||x.scope===filter)).sort((a,b)=>a.owner.localeCompare(b.owner)||a.familyId.localeCompare(b.familyId)||Number(!!a.combinedOf)-Number(!!b.combinedOf)||a.title.localeCompare(b.title));
 if(!entries.length){list.textContent='No maps found. Create one to begin.';return}
 const groups=new Map();for(const r of entries){const key=r.scope+':'+r.owner+':'+r.familyId;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r)}
 for(const family of groups.values()){
  const wrap=document.createElement('section');wrap.className='map-family';
  const label=document.createElement('div');label.className='map-family-heading';
  label.textContent=readableOwner(family[0].scope,family[0].owner)+(family.length>1?' · Related maps':'');wrap.append(label);
  for(const r of family){const b=document.createElement('button');b.className=`map-card ${r.combinedOf?'combined-map-card ':''}${current?.id===r.id?'active':''}`;
   const strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=r.title;
   small.textContent=(r.combinedOf?'Combined copy':r.originId?'Independent copy':'Original map');
   b.append(strong,small);b.onclick=()=>selectMap(r.id);wrap.append(b)}list.append(wrap);
 }
}
async function refreshList(){renderList()}
async function setImageUrl(){if(imageUrl){URL.revokeObjectURL(imageUrl);imageUrl=null}if(!current?.baseImage||current.baseImage.unlinked)return;try{const f=await readBytes(await imgDir(),current.baseImage.storageFile);imageUrl=URL.createObjectURL(f)}catch{current.baseImage.unlinked=true;current.baseImage.storageFile=null;notify('Map annotations recovered, but the original image is unavailable. Re-link it when ready.',8500)}}
async function selectMap(mid){if(current?.id===mid)return;await saveNow();if(dirty){notify('Unsaved changes must be resolved before switching maps. Export emergency recovery if needed.',9000);return}
 try{current=await loadMap(mid);history=[];future=[];previewObjects=[];selectedId=null;await setImageUrl();fit();renderList();$('emergency-save').disabled=false;status(`Loaded • ${current.title}`)}catch(e){notify(e.message,9000)}
}
async function saveNew(m,image=null){validate(m);if(records.some(r=>r.id===m.id))throw Error('Duplicate map identity');
 if(image){await saveImageFor(m,image)}
 await writeMap(m);current=m;history=[];future=[];selectedId=null;dirty=false;sessionRecovery.set(m.id,stripImageBytes(m));$('filter-scope').value=m.scope;await setImageUrl();fit();renderList();$('emergency-save').disabled=false;status('Saved • new map');
}
async function saveImageFor(map,file){const mime=fileMime(file);if(!['image/png','image/jpeg','image/webp'].includes(mime))throw Error('Only PNG, JPEG, and WebP are supported');if(file.size>64*1024*1024)throw Error('Image too large (64 MiB limit)');
 const bytes=await file.arrayBuffer();const hash=await sha(bytes),storageFile=`${map.id}.${mime==='image/png'?'png':mime==='image/webp'?'webp':'jpg'}`;
 const target=await imgDir();const handle=await getFile(target,storageFile,true),writer=await handle.createWritable();await writer.write(bytes);await writer.close();if(await sha(await (await handle.getFile()).arrayBuffer())!==hash)throw Error('Image write verification failed');
 const img=await createImageBitmap(file);map.baseImage={filename:file.name,sha256:hash,width:img.width,height:img.height,mime,storageFile,unlinked:false};img.close();
}
function changeTool(v){tool=v;document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('active',b.getAttribute('data-tool')===tool));$('stage').dataset.tool=tool;$('stamp-kind').classList.toggle('hidden',tool!=='stamp');if(current)render()}
function clickStage(e){if(!current)return;const p=pos(e),color=$('draw-color').value;const base={id:id(),x:p.x,y:p.y,source:null};
 if(tool==='text'){
  const txt=prompt('Location label:');if(!txt?.trim())return;checkpoint();current.objects.push({...base,kind:'text',text:txt.slice(0,180),fontSize:28,color});changed();render();
 }else if(tool==='stamp'){
  checkpoint();current.objects.push({...base,kind:'stamp',asset:$('stamp-kind').value,scale:1.5,rotation:0,color});changed();render();
 }
}
/* v4.2.1 pointer state machine. Keep the SVG tree in place during gestures.
   Capturing + rebuilding that tree was cancelling/retargeting input on some browsers. */
function objectTarget(e){const node=e.target?.closest?.('[data-id]');return node?current?.objects.find(o=>o.id===node.getAttribute('data-id')):null}
function eraseTarget(e){
 const direct=objectTarget(e);if(direct)return direct;
 // A thin hand-drawn stroke should be erasable even when the click misses its line by a few pixels.
 if(!current)return null;
 const p=pos(e),rect=$('stage-wrap').getBoundingClientRect();
 const tolerance=10*pan.w/Math.max(1,rect.width),limit=tolerance*tolerance;
 let best=null,bestD=limit;
 for(let i=current.objects.length-1;i>=0;i--){const obj=current.objects[i];if(obj.kind!=='stroke')continue;
  const pts=obj.points||[];for(let k=1;k<pts.length;k++){
   const [ax,ay]=pts[k-1],[bx,by]=pts[k],dx=bx-ax,dy=by-ay;
   const t=Math.max(0,Math.min(1,((p.x-ax)*dx+(p.y-ay)*dy)/(dx*dx+dy*dy||1)));
   const dist=(p.x-ax-t*dx)**2+(p.y-ay-t*dy)**2;
   if(dist<bestD){best=obj;bestD=dist}
  }
 }return best;
}
function selectVisual(){for(const node of $('stage').querySelectorAll('[data-id]'))node.setAttribute('opacity',node.getAttribute('data-id')===selectedId?'.75':'1')}
function updateObjectVisual(obj){
 const node=Array.from($('stage').querySelectorAll('[data-id]')).find(n=>n.getAttribute('data-id')===obj.id);
 if(!node)return;
 if(obj.kind==='stamp')node.setAttribute('transform',`translate(${obj.x} ${obj.y}) rotate(${obj.rotation||0}) scale(${obj.scale||1})`);
 else if(obj.kind==='shape')node.setAttribute('transform',`translate(${obj.x} ${obj.y}) rotate(${obj.rotation||0}) scale(${obj.w} ${obj.h})`);
 else if(obj.kind==='text'){node.setAttribute('x',obj.x);node.setAttribute('y',obj.y)}
 else if(obj.kind==='stroke')node.setAttribute('points',obj.points.map(p=>p.join(',')).join(' '));
}
function pointerDown(e){
 if(!current||e.button!==0)return;
 if(tool==='erase'){
  const obj=eraseTarget(e);if(!obj)return;
  e.preventDefault();checkpoint();current.objects=current.objects.filter(o=>o.id!==obj.id);
  if(selectedId===obj.id)selectedId=null;changed();render();return;
 }
 if(tool==='select'){
  const obj=objectTarget(e);selectedId=obj?.id||null;selectVisual();
  if(obj){gesture={type:'move',obj:obj.id,start:pos(e),origin:obj.kind==='stroke'?{points:structuredClone(obj.points)}:{x:obj.x,y:obj.y},moved:false};}
 }else if(tool==='pan')gesture={type:'pan',px:e.clientX,py:e.clientY,initial:{...pan}};
 else if(tool==='pencil'){
  const p=pos(e);draft={id:id(),kind:'stroke',points:[[p.x,p.y]],color:$('draw-color').value,width:3,source:null};
  gesture={type:'draw',preview:makeObject(draft,true)};$('stage').append(gesture.preview);
 }
 if(!gesture)return;
 e.preventDefault();$('stage').setPointerCapture(e.pointerId);
 if(tool==='pan')$('stage').classList.add('dragging');
}
function pointerMove(e){
 if(!current||!gesture)return;
 if(gesture.type==='pan'){
  const rect=$('stage-wrap').getBoundingClientRect();
  pan.x=gesture.initial.x-(e.clientX-gesture.px)/Math.max(1,rect.width)*gesture.initial.w;
  pan.y=gesture.initial.y-(e.clientY-gesture.py)/Math.max(1,rect.height)*gesture.initial.h;
  $('stage').setAttribute('viewBox',viewState());return;
 }
 const p=pos(e);
 if(gesture.type==='draw'){
  const pts=draft.points,last=pts[pts.length-1];
  if(Math.hypot(p.x-last[0],p.y-last[1])>1.6){pts.push([Math.round(p.x*10)/10,Math.round(p.y*10)/10]);gesture.preview.setAttribute('points',pts.map(v=>v.join(',')).join(' '));}
 }else if(gesture.type==='move'){
  const obj=current.objects.find(o=>o.id===gesture.obj);if(!obj)return;
  const dx=p.x-gesture.start.x,dy=p.y-gesture.start.y;
  if(!gesture.moved&&Math.hypot(dx,dy)<1)return;
  if(!gesture.moved){checkpoint();gesture.moved=true;}
  if(obj.kind==='stroke')obj.points=gesture.origin.points.map(([x,y])=>[x+dx,y+dy]);
  else{obj.x=gesture.origin.x+dx;obj.y=gesture.origin.y+dy}
  updateObjectVisual(obj);
 }
}
function pointerUp(e){
 if(!gesture)return;
 if(e?.pointerId!=null&&$('stage').hasPointerCapture(e.pointerId))$('stage').releasePointerCapture(e.pointerId);
 if(gesture.type==='draw'&&draft){
  if(draft.points.length===1){draft.points.push([draft.points[0][0]+1,draft.points[0][1]+1])}
  checkpoint();current.objects.push(draft);draft=null;changed();
 }else if(gesture.type==='move'&&gesture.moved)changed();
 gesture=null;$('stage').classList.remove('dragging');render();
}
function wheel(e){if(!current)return;e.preventDefault();const pointer=pos(e),scale=e.deltaY>0?1.15:.87;const nw=Math.max(current.canvas.width*.01,Math.min(current.canvas.width*10,pan.w*scale)),nh=pan.h*nw/pan.w;const rect=$('stage').getBoundingClientRect(),fx=(e.clientX-rect.left)/rect.width,fy=(e.clientY-rect.top)/rect.height;pan={x:pointer.x-fx*nw,y:pointer.y-fy*nh,w:nw,h:nh};render()}
function adjustSelected(action){if(!current||!selectedId)return notify('Select an annotation first.');const obj=current.objects.find(o=>o.id===selectedId);if(!obj)return;checkpoint();if(action==='rotate'){obj.rotation=((obj.rotation||0)+15)%360}else if(action==='duplicate'){const next=structuredClone(obj);next.id=id();next.x=(next.x||0)+30;next.y=(next.y||0)+30;if(next.kind==='stroke')next.points=next.points.map(p=>[p[0]+30,p[1]+30]);current.objects.push(next);selectedId=next.id}else if(action==='delete'){current.objects=current.objects.filter(o=>o.id!==selectedId);selectedId=null}else{const factor=action==='enlarge'?1.2:.8;if(obj.kind==='stamp')obj.scale=(obj.scale||1)*factor;else if(obj.kind==='shape'){obj.w*=factor;obj.h*=factor}else if(obj.kind==='text')obj.fontSize=(obj.fontSize||30)*factor;else if(obj.kind==='stroke')obj.width=(obj.width||3)*factor}changed();render()}
function zoom(f){if(!current)return;pan={x:pan.x+pan.w*(1-f)/2,y:pan.y+pan.h*(1-f)/2,w:pan.w*f,h:pan.h*f};render()}
async function makeNewMap(){if(!work){notify('Choose a folder first');return}$('dlg-new').showModal()}
function askImage(){return new Promise(resolve=>{const inp=$('pick-image');inp.value='';inp.onchange=()=>resolve(inp.files?.[0]||null);inp.click();})}
async function finishNew(dialog){
 const title=sanitize($('new-title').value),scope=$('new-scope').value,owner=currentOwner('new'),mode=$('new-mode').value;
 const width=Number($('new-width').value),height=Number($('new-height').value);
 if(!title||!owner){notify('Enter a map and novel/series name');return}if(!Number.isInteger(width)||!Number.isInteger(height)||width<100||height<100||width>12000||height>12000){notify('Choose canvas dimensions from 100 to 12000');return}
 const map=newMap({title,scope,owner,width,height,background:$('new-background').value,outline:mode==='image'?'none':$('new-outline').value});map.canvas.grid=mode==='blank'&&$('new-grid').checked;
 let image=null;if(mode==='image'){image=await askImage();if(!image)return;const dummy=await createImageBitmap(image);map.canvas.width=dummy.width;map.canvas.height=dummy.height;dummy.close();if(map.canvas.width>12000||map.canvas.height>12000){notify('Image exceeds the 12000px size limit');return}}
 await saveNow();if(dirty)return;
 try{await saveNew(map,image);dialog.close()}catch(e){notify(e.message,10000)}
}
let copyCombined=false;
function openCopy(combined=false){if(!current)return;copyCombined=combined;$('copy-heading').textContent=combined?'Create independent combined version':'Copy map';$('copy-title').value=combined?`${current.title} (Combined)`:`${current.title} (Copy)`;$('copy-scope').value=combined?'series':current.scope;if(attached){chooseAttachedOwner('copy');$('copy-owner-select').value=ownerOptions($('copy-scope').value).some(x=>x.id===current.owner)?current.owner:(ownerOptions($('copy-scope').value)[0]?.id||'')}else $('copy-owner').value=current.owner;$('dlg-copy').showModal()}
async function doCopy(){if(!current)return;await saveNow();if(dirty)return;
 const source=current,scope=$('copy-scope').value,owner=currentOwner('copy'),title=sanitize($('copy-title').value);if(!title||!owner)return notify('Enter a destination and title');
 if(copyCombined&&scope!=='series')return notify('Combined versions belong to a series');
 try{const map=duplicateMap(source,{scope,owner,title,combined:copyCombined});
  let image=null;if(source.baseImage&&!source.baseImage.unlinked){image=await readBytes(await imgDir(),source.baseImage.storageFile)}
  else if(source.baseImage){map.baseImage={...map.baseImage,unlinked:true,storageFile:null}}
  await saveNew(map,image);$('dlg-copy').close();notify('Independent map copy saved; the original was not changed.')}
 catch(e){notify(e.message,9500)}
}
function listSources(){const sel=$('combine-source');sel.replaceChildren();const allowed=shownOwners();for(const r of records){if(r.id===current.id||(allowed&&!allowed.has(r.owner)))continue;const m=allMaps.get(r.id);if(!m||!compatible(current,m))continue;const op=document.createElement('option');op.value=r.id;op.textContent=`${r.title} (${r.scope}: ${r.owner})`;sel.append(op)}return sel.options.length}
async function openCombine(){if(!current)return;if(current.scope!=='series'||!current.combinedOf)return notify('Create a separate Combined Copy of a series map before importing book annotations. The original series map stays untouched.',9500);await saveNow();if(dirty)return;for(const r of records)await loadMap(r.id);if(!listSources())return notify('No compatible maps. Copy a map into another book or series first.');$('combine-mode').value='all';updateCombine();$('dlg-combine').showModal()}
function selectedSource(){return allMaps.get($('combine-source').value)}
function updateCombine(){const src=selectedSource(),box=$('combine-picks');box.replaceChildren();previewObjects=[];
 if(!src){render();return}const selected=$('combine-mode').value==='selected';box.classList.toggle('hidden',!selected);
 for(let i=0;i<src.objects.length;i++){
  const o=src.objects[i],row=document.createElement('label'),cb=document.createElement('input'),txt=document.createElement('span');cb.type='checkbox';cb.value=o.id;cb.checked=true;cb.addEventListener('change',previewCombine);txt.textContent=`${i+1}. ${o.kind}${o.text?' — '+o.text.slice(0,30):o.asset?' — '+o.asset:''}`;row.className='pickrow';row.append(cb,txt);box.append(row);
 }
 previewCombine();
}
function chosenIds(){const src=selectedSource();if(!src)return[];return $('combine-mode').value==='all'?src.objects.map(x=>x.id):[...$('combine-picks').querySelectorAll('input:checked')].map(x=>x.value)}
function previewCombine(){const src=selectedSource();if(!src)return;const wanted=new Set(chosenIds());const existing=new Set(current.objects.filter(x=>x.source).map(x=>`${x.source.mapId}:${x.source.objectId}`));previewObjects=src.objects.filter(x=>wanted.has(x.id)).filter(o=>{const source=o.source||{mapId:src.id,objectId:o.id};return !existing.has(`${source.mapId}:${source.objectId}`)});
 $('combine-preview').textContent=`Preview: ${previewObjects.length} additions from ${src.objects.length} source annotations, shown faintly on the map. Previously imported objects are skipped.`;render()}
async function doCombine(){const src=selectedSource();if(!src)return;const ids=chosenIds();if(!ids.length)return notify('No annotations selected');
 try{const before=structuredClone(current),result=combine(current,src,ids);if(!result.added){notify(`No new annotations to import (${result.skipped} duplicates).`);return}
  await saveRevision(before,'before-combine');checkpoint();current=result.map;previewObjects=[];changed();render();$('dlg-combine').close();notify(`Imported ${result.added} object(s) as one undoable action. ${result.skipped} duplicate(s) skipped.`)}
 catch(e){notify(e.message,9500)}
}
async function saveRevision(map,reason){const dir=await revDir();const filename=`${map.id}--${Date.now()}--${reason}.json`;await writeVerified(dir,filename,jsonText(map))}
function relinkDialog(){if(!current?.baseImage?.unlinked)return; $('expected-filename').textContent=current.baseImage.filename||'(unknown)';$('dlg-relink').showModal()}
async function doRelink(){const original=current.baseImage;const file=await askImage();if(!file)return;const hash=await sha(await file.arrayBuffer());if(hash!==original.sha256)return notify('Image fingerprint does not match the original. Nothing was replaced. Please choose the original file.',11000);
 checkpoint();await saveImageFor(current,file);changed();await setImageUrl();render();$('dlg-relink').close();notify('Original image successfully re-linked.')}
function toBlank(reset=false){if(!current)return;const msg=reset?'Discard every recovered annotation and start a new blank canvas? A revision copy will be saved first.':'Convert this map to a blank canvas while keeping all recovered annotations?';if(!confirm(msg))return;
 const before=structuredClone(current);saveRevision(before,reset?'before-reset':'before-convert').then(()=>{checkpoint();current.baseImage=null;if(reset)current.objects=[];changed();setImageUrl().then(render);$('dlg-relink').close();notify(reset?'New blank map created.':'Converted to blank canvas; recovered work retained.')}).catch(e=>notify('Revision backup failed; no changes were made. '+e.message))}
function downloadBlob(blob,name){const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
function safeName(s){return s.replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,90)||'World_Map'}
async function emergency(){if(!current)return;const payload={type:'character-bookshelf-world-map-recovery',schema:SCHEMA,exportedAt:new Date().toISOString(),notice:'Image bytes deliberately excluded',map:stripImageBytes(current)};
 downloadBlob(new Blob([jsonText(payload)],{type:'application/json'}),`${safeName(current.title)}_Emergency_Annotations.json`);notify('Emergency file downloaded. Source image excluded. Keep it somewhere safe.');}
async function restoreEmergency(file){try{const payload=JSON.parse(await file.text());if(payload.type!=='character-bookshelf-world-map-recovery')throw Error('Not a World Maps emergency file');const m=recoverMap(payload.map);validate(m);m.id=id();m.title=`${m.title} (Recovered)`;m.createdAt=new Date().toISOString();m.updatedAt=m.createdAt;await saveNow();if(dirty)return;await saveNew(m,null);notify('Annotations restored. Re-upload the original source image if this map is Unlinked.',9000)}catch(e){notify(e.message,10000)}}
async function imageData(file){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=()=>rej(r.error);r.onload=()=>res(r.result);r.readAsDataURL(file)})}
async function exportSvg({annotationsOnly=false}={}){
 if(!current)return '';const tree=makeCanvas({annotationsOnly,withImage:!annotationsOnly,ghosts:false,editorGrid:false});
 tree.querySelectorAll('.stamp-hit').forEach(n=>n.remove());
 if(!annotationsOnly&&current.baseImage&&!current.baseImage.unlinked){const img=tree.querySelector('image');if(img){const f=await readBytes(await imgDir(),current.baseImage.storageFile);img.setAttribute('href',await imageData(f))}}
 else if(!annotationsOnly&&current.baseImage?.unlinked){notify('Original image missing: exporting annotations on their canvas background.',8500)}
 return new XMLSerializer().serializeToString(tree);
}
async function doExport(){if(!current)return;const format=$('export-format').value,annotationsOnly=$('export-content').value==='annotations';const printWindow=format==='pdf'?window.open('','_blank'):null;try{const str=await exportSvg({annotationsOnly}),name=safeName(current.title);
 if(format==='svg'){downloadBlob(new Blob([str],{type:'image/svg+xml;charset=utf-8'}),name+'.svg');}
 else if(format==='png'){
  const {width,height}=current.canvas;if(width*height>35_000_000||Math.max(width,height)>8192)throw Error('PNG export exceeds browser-safe size. Export SVG or reduce canvas dimensions.');
  const url=URL.createObjectURL(new Blob([str],{type:'image/svg+xml'}));const img=new Image();await new Promise((res,rej)=>{img.onload=res;img.onerror=()=>rej(Error('Browser could not render SVG export'));img.src=url});
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);URL.revokeObjectURL(url);const blob=await new Promise(res=>canvas.toBlob(res,'image/png'));if(!blob)throw Error('PNG encoding failed');downloadBlob(blob,name+'.png');
 }else if(format==='pdf'){
  if(!printWindow)throw Error('Allow popups to use Print / Save as PDF');
  printWindow.document.open();printWindow.document.write(`<!doctype html><html><head><title>${name}</title><style>@page{size:landscape;margin:6mm}body{margin:0}svg{max-width:100%;height:auto;max-height:95vh;display:block;margin:auto}</style></head><body>${str}</body></html>`);printWindow.document.close();printWindow.focus();setTimeout(()=>printWindow.print(),650);
 }
 $('dlg-export').close();notify(format==='pdf'?'Opened browser print: choose Save as PDF.':'Export ready; editable map files were not changed.');
 }catch(e){if(printWindow)printWindow.close();notify(e.message,10000)}}
function crc32(data){let v=0xffffffff;for(const b of data){v^=b;for(let i=0;i<8;i++)v=(v&1)?(v>>>1)^0xedb88320:v>>>1}return (v^0xffffffff)>>>0}
function zipStored(entries){let offset=0,locals=[],centrals=[];const enc=new TextEncoder();const u16=(v)=>[v&255,(v>>8)&255];const u32=(v)=>[v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255];const array=(...parts)=>Uint8Array.from(parts.flat());
 for(const {name,bytes} of entries){const n=enc.encode(name),c=crc32(bytes),sz=bytes.length;const lh=array(...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(c),...u32(sz),...u32(sz),...u16(n.length),...u16(0));locals.push(lh,n,bytes);const ch=array(...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(c),...u32(sz),...u32(sz),...u16(n.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset));centrals.push(ch,n);offset+=lh.length+n.length+sz;}
 const centralLen=centrals.reduce((a,p)=>a+p.length,0);const end=array(...u32(0x06054b50),...u16(0),...u16(0),...u16(entries.length),...u16(entries.length),...u32(centralLen),...u32(offset),...u16(0));return new Blob([...locals,...centrals,end],{type:'application/zip'});
}
async function fullBackup(){if(!work)return;await saveNow();if(dirty)return;try{status('Building full backup ZIP…');const entries=[],enc=new TextEncoder();let total=0;
 async function add(name,bytes){total+=bytes.byteLength;if(total>512*1024*1024)throw Error('Backup exceeds the 512 MiB safety budget');entries.push({name,bytes:new Uint8Array(bytes)})}
 await add(INDEX,enc.encode(jsonText({schema:SCHEMA,maps:records,product:'Character Bookshelf World Maps'})));
 for(const r of records){const m=await loadMap(r.id);await add(`maps/${m.id}.json`,enc.encode(jsonText(m)));if(m.baseImage&&!m.baseImage.unlinked){const blob=await readBytes(await imgDir(),m.baseImage.storageFile);await add(`images/${m.baseImage.storageFile}`,await blob.arrayBuffer())}}
 for await (const [filename,handle] of (await revDir()).entries()){if(handle.kind==='file'){const f=await handle.getFile();await add('revisions/'+filename,await f.arrayBuffer())}}
 const zip=zipStored(entries);downloadBlob(zip,`Character_Bookshelf_World_Maps_Backup_${new Date().toISOString().slice(0,10)}.zip`);notify('Full ZIP backup downloaded. Store it separately from your working folder.');
 }catch(e){notify('Backup failed: '+e.message,9500)}finally{status('Connected • local folder')}}
async function deleteMap(){if(!current)return;if(!confirm(`Delete map "${current.title}"? This cannot be undone. Create a full backup first.`))return;const m=current;try{await saveNow();if(dirty)return;const dir=await mapDir();const name=`${m.id}.json`,text=await readText(dir,name);if(!text)throw Error('Map file missing');if(await sha(new TextEncoder().encode(text))!==savedHashes.get(name))throw Error('Map changed externally; refusing delete');await dir.removeEntry(name); if(attachedBridge)try{await attachedBridge.registerMapDeletion(dir,name)}catch(e){console.warn('RAM recovery deletion registration failed',e)} // do not destroy image or revisions: manual cleanup safer
  records=records.filter(r=>r.id!==m.id);await writeIndex();allMaps.delete(m.id);savedHashes.delete(name);current=null;history=[];future=[];await setImageUrl();render();renderList();notify('Map JSON removed from index. Source image/revisions retained for safety.');}
 catch(e){notify(e.message,10000)}}
/* UI wiring */
$('choose-folder').onclick=()=>workspace().catch(e=>notify('Folder connection failed: '+e.message,10000));
$('back-to-bookshelf').onclick=()=>{if(window.parent!==window&&window.parent.CBWorldMapsBridge){if(!window.parent.CBWorldMapsBridge.close())notify('Map changes are still saving. Wait for Saved or use Emergency Recovery before leaving.',9000)}else window.history.back()};
$('toggle-sidebar').onclick=()=>{const hidden=document.body.classList.toggle('sidebar-collapsed');$('toggle-sidebar').setAttribute('aria-expanded',String(!hidden))};
$('new-map').onclick=makeNewMap;
$('form-new').addEventListener('submit',e=>{if(e.submitter?.value==='create'){e.preventDefault();finishNew($('dlg-new'))}});
$('filter-scope').onchange=renderList;
document.querySelectorAll('#toolbar [data-tool]').forEach(b=>b.onclick=()=>changeTool(b.dataset.tool));
$('undo').onclick=undo;$('redo').onclick=redo;$('zoom-in').onclick=()=>zoom(.8);$('zoom-out').onclick=()=>zoom(1.25);$('fit-map').onclick=fit;document.querySelectorAll('[data-adjust]').forEach(b=>b.onclick=()=>adjustSelected(b.dataset.adjust));
$('copy-map').onclick=()=>openCopy(false);$('combined-map').onclick=()=>openCopy(true);
$('form-copy').addEventListener('submit',e=>{if(e.submitter?.value==='copy'){e.preventDefault();doCopy()}});
$('import-annotations').onclick=openCombine;
$('combine-source').onchange=updateCombine;$('combine-mode').onchange=updateCombine;
$('form-combine').addEventListener('submit',e=>{if(e.submitter?.value==='merge'){e.preventDefault();doCombine()}});
$('dlg-combine').addEventListener('close',()=>{previewObjects=[];render()});
$('relink').onclick=relinkDialog;
$('form-relink').addEventListener('submit',e=>{const action=e.submitter?.value;if(action!=='cancel'){e.preventDefault();if(action==='link')doRelink().catch(e=>notify(e.message));if(action==='blank')toBlank(false);if(action==='reset')toBlank(true)}});
$('export-map').onclick=()=>$('dlg-export').showModal();
$('form-export').addEventListener('submit',e=>{if(e.submitter?.value==='export'){e.preventDefault();doExport()}});
$('delete-map').onclick=deleteMap;
$('emergency-save').onclick=emergency;
$('backup-full').onclick=fullBackup;
$('import-recovery').onclick=()=>$('pick-recovery').click();
$('pick-recovery').onchange=e=>{const f=e.target.files?.[0];if(f)restoreEmergency(f);e.target.value=''};
$('stage').addEventListener('click',e=>{if(gesture||['pencil','select','pan'].includes(tool))return;clickStage(e)});
$('stage').addEventListener('dblclick',e=>{if(tool!=='select'||!current)return;const target=e.target.closest('[data-id]');const o=current.objects.find(x=>x.id===target?.getAttribute('data-id'));if(!o||o.kind!=='text')return;const input=prompt('Edit map label:',o.text);if(input===null||!input.trim()||input===o.text)return;checkpoint();o.text=input.slice(0,180);changed();render()});
$('draw-color').addEventListener('change',()=>{if(tool!=='select'||!selectedId||!current)return;const o=current.objects.find(x=>x.id===selectedId);if(!o)return;checkpoint();if(o.kind==='shape')o.fill=$('draw-color').value;else if(o.kind==='text'||o.kind==='stamp'||o.kind==='stroke')o.color=$('draw-color').value;changed();render()});
$('toggle-grid').onclick=()=>{if(!current)return;checkpoint();current.canvas.grid=!current.canvas.grid;changed();render()};
$('stage').addEventListener('pointerdown',pointerDown);$('stage').addEventListener('pointermove',pointerMove);$('stage').addEventListener('pointerup',pointerUp);$('stage').addEventListener('pointercancel',pointerUp);$('stage').addEventListener('wheel',wheel,{passive:false});
window.addEventListener('resize',()=>{if(current)render()});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!document.querySelector('dialog[open]')){e.preventDefault();e.shiftKey?redo():undo()}});
changeTool('select');
if(window.parent===window)$('back-to-bookshelf').classList.add('hidden');

window.CBWorldMapsSession={canClose:()=>!dirty&&!busy};
if(window.parent!==window){
 $('choose-folder').classList.add('hidden');
 if(!window.parent.CBWorldMapsBridge){
  status('Bookshelf connection unavailable');
  $('maps-list').textContent='Could not connect to the active Character Bookshelf library. Return to Bookshelf and reopen World Maps; no map files were changed.';
  $('new-map').disabled=true;
 }else{
  connectToBookshelf().catch(e=>{
   console.error('World Maps connection failure:',e);
   status('Bookshelf connection failed');
   $('maps-list').textContent='Could not load maps from your writer folder: '+e.message+'. Existing map files have not been erased.';
   notify('World Maps connection failed: '+e.message,30000);
   $('new-map').disabled=true;
  });
 }
}
// Only one toolbar menu opens at a time.
for(const details of document.querySelectorAll('details.menu')){
 details.addEventListener('toggle',()=>{
  if(details.open)for(const other of document.querySelectorAll('details.menu'))if(other!==details)other.open=false;
 });
 details.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>details.open=false));
}
