'use strict';
/* Character Bookshelf — USB folder storage. No accounts, tokens, or remote APIs. */
const $ = id => document.getElementById(id);
const el = (tag, className = '', text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const cleanName = value => String(value || '').trim();
const folderSafe = value => {
  const name = cleanName(value).replace(/[\\/:*?"<>|\x00-\x1f]/g, '-').replace(/[. ]+$/g, '').slice(0, 70) || 'Untitled';
  return /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(name) ? '_' + name : name;
};
const randomId = () => crypto.randomUUID();
const dateNow = () => new Date().toISOString();
const status = (message, kind = '') => { $('saveStatus').textContent = message; $('saveStatus').dataset.kind = kind; };
let toastTimer;
function toast(message, isError = false) {
  const t = $('toast');
  clearTimeout(toastTimer);
  t.textContent = message;
  t.classList.toggle('error', isError);
  t.classList.remove('hidden');
  toastTimer = setTimeout(() => t.classList.add('hidden'), 6000);
}
const state = {
  root: null, selectedLocation: null, manifest: null, writer: null, writerDir: null,
  novels: [], novel: null, novelDir: null, charsDir: null, portraitsDir: null,
  characters: [], active: null, saveTimer: null, saving: null,
  revision: 0, savedRevision: 0, portraitUrl: null, galleryUrls: [], epoch: 0, treeMeta: null, treeRevision: 0, treeSavedRevision: 0, treeTimer: null, treeSaving: null, timelineEvents: [], timelineFilter: 'all', coverUrls: [], searchEpoch: 0
};

/* v3.9 — volatile recovery. Only file bytes are kept in RAM. A browser reload
   or closing this tab destroys them. No contents are uploaded or put in storage.
   Storage pointers are File System Access handles, not paths on the PC. */
const RECOVERY_LIMIT = 384 * 1024 * 1024, RECOVERY_FILE_LIMIT = 20000;
const memoryRecovery = {
  files:new Map(), pending:new Map(), handles:new WeakMap(), versions:new Map(),
  bytes:0, complete:false, scanning:false, partialReason:'Not loaded',
  lastVerified:null, lastFailure:null, disconnected:false, active:false, refreshing:false,
  scanId:0, writeSerial:0, lastReport:null, lastRecoveryFolder:null, lastRecoveryHandle:null
};
const encoder = new TextEncoder();
function sameBytes(a,b) {
  if(!a||!b||a.byteLength!==b.byteLength)return false;
  for(let i=0;i<a.byteLength;i++)if(a[i]!==b[i])return false;
  return true;
}
async function contentBytes(content) {
  if(content instanceof Uint8Array)return content.slice();
  if(content instanceof ArrayBuffer)return new Uint8Array(content.slice(0));
  if(typeof content==='string')return encoder.encode(content);
  return new Uint8Array(await new Blob([content]).arrayBuffer());
}
async function recoveryPath(handle) {
  if(!state.root || !handle)return null;
  if(memoryRecovery.handles.has(handle))return memoryRecovery.handles.get(handle);
  if(typeof state.root.resolve!=='function')return null;
  try {
    const parts=await state.root.resolve(handle);
    if(!parts)return null;
    const path=parts.join('/');memoryRecovery.handles.set(handle,path);
    return path;
  }catch{return null;}
}
function recoveryStore(path,data,version=null) {
  if(path===null || !path || !data)return;
  const previous=memoryRecovery.files.get(path);
  const size=memoryRecovery.bytes-(previous?.byteLength||0)+data.byteLength;
  if(size>RECOVERY_LIMIT || (previous===undefined&&memoryRecovery.files.size>=RECOVERY_FILE_LIMIT)) {
    memoryRecovery.complete=false;memoryRecovery.partialReason='RAM recovery capacity limit reached';return;
  }
  memoryRecovery.files.set(path,data.slice());memoryRecovery.bytes=size;
  if(version!==null)memoryRecovery.versions.set(path,version);
}
function recoveryRemove(path,prefix=false) {
  if(!path)return;
  for(const [key,data] of memoryRecovery.files)if(key===path||(prefix&&key.startsWith(path+'/'))){
    memoryRecovery.bytes-=data.byteLength;memoryRecovery.files.delete(key);
    memoryRecovery.versions.set(key,++memoryRecovery.writeSerial);
    memoryRecovery.pending.delete(key);
  }
}
async function removeTrackedEntry(directory,name,options) {
  const base=await recoveryPath(directory),path=base===null?null:[base,name].filter(Boolean).join('/');
  await directory.removeEntry(name,options);
  if(path)recoveryRemove(path,!!options?.recursive);
}
async function captureRecoverySnapshot() {
  if(!state.root || memoryRecovery.scanning)return;
  const scan=++memoryRecovery.scanId,root=state.root;
  memoryRecovery.scanning=true;memoryRecovery.partialReason='Scanning the accessible library';
  const scanVersion=memoryRecovery.writeSerial;
  let count=0,finished=true,reason='';
  const walk=async(dir,prefix='')=>{
    for await(const [name,entry] of dir.entries()) {
      if(scan!==memoryRecovery.scanId || root!==state.root)throw Error('Snapshot interrupted by a library change.');
      if(!name||name==='.'||name==='..'||name.includes('/')||name.includes('\\'))throw Error('Invalid library file name.');
      const path=prefix+name;
      memoryRecovery.handles.set(entry,path);
      if(entry.kind==='directory'){await walk(entry,path+'/');continue;}
      if(entry.kind!=='file')continue;
      const data=new Uint8Array(await (await entry.getFile()).arrayBuffer());
      count++;
      if(memoryRecovery.bytes+data.byteLength>RECOVERY_LIMIT || count>RECOVERY_FILE_LIMIT)
        throw Error('Library exceeds '+Math.round(RECOVERY_LIMIT/1048576)+' MiB / '+RECOVERY_FILE_LIMIT+' file RAM limit.');
      // Never let an older file read replace a newer verified write during scanning.
      if((memoryRecovery.versions.get(path)||0)<=scanVersion)recoveryStore(path,data);
    }
  };
  try {await walk(root);}catch(error){finished=false;reason=error.message;}
  if(scan===memoryRecovery.scanId){
    memoryRecovery.complete=finished;
    memoryRecovery.partialReason=finished?'':reason;
    memoryRecovery.scanning=false;
    if(!finished)console.warn('Character Bookshelf recovery snapshot incomplete:',reason);
    renderStorageStatus();
  }
}
function beginVolatileRecovery() {
  memoryRecovery.scanId++;
  memoryRecovery.files.clear();memoryRecovery.pending.clear();memoryRecovery.versions.clear();
  memoryRecovery.handles=new WeakMap();memoryRecovery.bytes=0;
  memoryRecovery.complete=false;memoryRecovery.scanning=false;
  memoryRecovery.partialReason='Loading library into RAM';
  memoryRecovery.lastVerified=null;memoryRecovery.lastFailure=null;
  memoryRecovery.disconnected=false;memoryRecovery.active=true;
  void captureRecoverySnapshot();
}
async function rememberRead(handle,bytes) {
  if(!memoryRecovery.active || !state.root)return;
  const path=await recoveryPath(handle);
  if(path!==null && (memoryRecovery.refreshing||!memoryRecovery.files.has(path)))
    recoveryStore(path,bytes,memoryRecovery.refreshing?++memoryRecovery.writeSerial:null);
}
function storageFailed(error) {
  memoryRecovery.lastFailure=String(error?.message||error);
  memoryRecovery.disconnected=error?.name==='NotFoundError'||error?.name==='NotAllowedError'||error?.name==='NotReadableError';
  renderStorageStatus();
}
function renderStorageStatus() {
  const host=$('storageStatusDetails');if(!host)return;
  const summary=memoryRecovery.scanning?'Building snapshot':memoryRecovery.complete?'Complete':memoryRecovery.active?'Partial':'Unavailable';
  const items=[
    ['Original location',memoryRecovery.disconnected?'Unavailable / needs attention':state.root?.name||'Not connected'],
    ['Last verified write',memoryRecovery.lastVerified?formatMoment(memoryRecovery.lastVerified):'Not yet verified'],
    ['Pending file writes',String(memoryRecovery.pending.size)],
    ['RAM snapshot',summary+' · '+memoryRecovery.files.size+' files · '+(memoryRecovery.bytes/1048576).toFixed(1)+' MiB'],
    ['Snapshot limits',Math.round(RECOVERY_LIMIT/1048576)+' MiB / '+RECOVERY_FILE_LIMIT+' files'],
    ['Snapshot details',memoryRecovery.partialReason||'All accessible files captured'],
    ['Last storage error',memoryRecovery.lastFailure||'None']
  ];
  host.replaceChildren();
  for(const [label,value] of items){const row=el('div','statusDataRow');row.append(el('strong','',label),el('span','',value));host.append(row);}
}
function memorySnapshotForRecovery() {
  const files=new Map([...memoryRecovery.files].map(([k,v])=>[k,v.slice()]));
  for(const [path,item] of memoryRecovery.pending)files.set(path,item.bytes.slice());
  // Uncommitted character/tree edits stay in their editor state, even if the USB
  // disconnected before their file handle could be used again.
  if(state.writer?.folder && state.novel?.folder) {
    const prefix=state.writer.folder+'/'+state.novel.folder+'/';
    if(state.novel&&!files.has(prefix+'novel.json'))files.set(prefix+'novel.json',encoder.encode(JSON.stringify(state.novel,null,2)+'\n'));
    for(const character of state.characters)if(character._filename){
      const path=prefix+'characters/'+character._filename;
      if(!files.has(path)||character===state.active&&hasUnsaved())
        files.set(path,encoder.encode(JSON.stringify(diskProfile(character),null,2)+'\n'));
    }
    if(state.treeMeta&&treeUnsaved())files.set(prefix+'character-tree.json',encoder.encode(JSON.stringify(state.treeMeta,null,2)+'\n'));
  }
  const manifest=structuredClone(state.manifest);
  if(!manifest)throw Error('No library manifest is available in this tab.');
  const writerPaths=manifest.writers.filter(w=>[...files.keys()].some(k=>k.startsWith(w.folder+'/')));
  const full=memoryRecovery.complete; // Empty writer folders legitimately have no files to snapshot.
  // If capture failed, do not present a copy as a full multi-writer recovery.
  let retained=full?manifest.writers:writerPaths;
  if(!full){
    if(!state.writer)throw Error('Select a writer before performing a partial recovery.');
    retained=writerPaths.filter(w=>w.id===state.writer.id);
  }
  manifest.writers=retained;
  if(!retained.length)throw Error('No writer files are currently recoverable.');
  const allowed=new Set(retained.map(w=>w.folder));
  for(const path of [...files.keys()]){
    if(path==='character-archive-manifest.json')continue;
    if(![...allowed].some(folder=>path.startsWith(folder+'/')))files.delete(path);
  }
  files.set('character-archive-manifest.json',encoder.encode(JSON.stringify(manifest,null,2)+'\n'));
  return {files,full,retained,originalWriters:state.manifest?.writers?.length||0,pending:memoryRecovery.pending.size,reason:memoryRecovery.partialReason};
}
function recoveryOffer(message='The original storage location could not be accessed.') {
  $('recoveryReason').textContent=message+' The tab can save the information currently in memory to a different folder. Do not reload or close the page yet.';
  $('recoverySaveStatus').textContent='No files have been copied to a new location.';
  $('openRecoveredLibraryBtn').classList.add('hidden');
  if(!$('recoveryDialog').open)$('recoveryDialog').showModal();
}
function downloadRecoveryReport() {
  if(!memoryRecovery.lastReport)return;
  downloadBlob(new Blob([JSON.stringify(memoryRecovery.lastReport,null,2)+'\n'],{type:'application/json'}),'Character-Bookshelf-Recovery-Report.json');
}
async function emergencySaveElsewhere() {
  const button=$('saveRecoveryElsewhereBtn');button.disabled=true;
  memoryRecovery.lastReport=null;memoryRecovery.lastRecoveryHandle=null;
  $('downloadRecoveryReportBtn').classList.add('hidden');$('openRecoveredLibraryBtn').classList.add('hidden');
  let targetName=null,copied=0,failed=[];
  try {
    if(typeof window.showDirectoryPicker!=='function')throw Error('Folder selection is unavailable in this browser.');
    const recovery=memorySnapshotForRecovery();
    const target=await window.showDirectoryPicker({mode:'readwrite'});
    if(typeof target.queryPermission==='function'&&await target.queryPermission({mode:'readwrite'})!=='granted'){
      if(await target.requestPermission({mode:'readwrite'})!=='granted')throw Error('Write access was denied.');
    }
    // A failed/removable USB handle can throw even on equality checks. Never
    // require successful access to the missing drive to save to a NEW target.
    try{
      if(state.root && typeof state.root.isSameEntry==='function' && await state.root.isSameEntry(target))
        throw Error('Select a different destination from the original library.');
      if(state.root && typeof state.root.resolve==='function' && await state.root.resolve(target)!==null)
        throw Error('The recovery location must not be inside the original library.');
    }catch(error){
      if(!['NotFoundError','NotReadableError','NotAllowedError'].includes(error.name))throw error;
    }
    const base='Character Bookshelf Recovery '+dateNow().replace(/[:.]/g,'-');
    let name=base,idx=2;
    while(true){try{await target.getDirectoryHandle(name);name=base+'-'+idx++;}
      catch(error){if(error.name==='NotFoundError')break;throw error;}}
    const output=await target.getDirectoryHandle(name,{create:true});targetName=name;
    // Empty writer folders are part of a complete library too.
    for(const writer of recovery.retained)await output.getDirectoryHandle(writer.folder,{create:true});
    $('recoverySaveStatus').textContent='Copying '+recovery.files.size+' recoverable files…';
    for(const [path,bytes] of recovery.files){
      try{
        const segments=path.split('/'),filename=segments.pop();let dir=output;
        for(const segment of segments)dir=await dir.getDirectoryHandle(segment,{create:true});
        const handle=await dir.getFileHandle(filename,{create:true});
        await writeHandle(handle,bytes);copied++;
      }catch(e){failed.push({path,error:e.message});break;}
    }
    const success=failed.length===0;
    const report={type:'character-bookshelf-recovery-report',createdAt:dateNow(),folder:targetName,
      completeLibrary:success&&recovery.full, writersIncluded:recovery.retained.map(w=>w.name),
      originalWriterCount:recovery.originalWriters,filesExpected:recovery.files.size,filesWritten:copied,
      pendingEditsIncluded:recovery.pending,reason:recovery.reason||null,errors:failed};
    memoryRecovery.lastReport=report;
    memoryRecovery.lastRecoveryFolder=targetName;
    $('downloadRecoveryReportBtn').classList.remove('hidden');
    if(!success)throw Error('Only '+copied+' files copied. See the recovery report; the destination may be incomplete.');
    memoryRecovery.lastRecoveryHandle=output;
    $('openRecoveredLibraryBtn').classList.remove('hidden');
    $('recoverySaveStatus').textContent='Recovery saved in '+targetName+': '+copied+' files; '+recovery.retained.length+' writer(s). '+(recovery.full?'Full snapshot':'PARTIAL RECOVERY — other data may be missing')+'. Save the report and inspect the files before relying on them.';
    toast('Recovery copy saved. It was not switched into the live application.');
  }catch(error){
    if(error.name!=='AbortError'){
      $('recoverySaveStatus').textContent='Recovery was not completed: '+error.message;
      toast('Emergency save: '+error.message,true);
    }
  }finally{button.disabled=false;renderStorageStatus();}
}
async function openRecoveredLibrary() {
  const root=memoryRecovery.lastRecoveryHandle;if(!root)return;
  const writerId=state.writer?.id;
  try {
    const manifest=await readJSON(await root.getFileHandle('character-archive-manifest.json'));
    validateManifest(manifest);
    // This is a deliberate switch, NOT a retry against the missing original.
    clearRootState();
    state.root=root;state.selectedLocation=root;state.manifest=manifest;
    beginVolatileRecovery();
    $('folderName').textContent=root.name+' (recovered copy)';
    $('retrySaveBtn').classList.add('hidden');$('downloadUnsavedBtn').classList.add('hidden');
    renderWriterCards();setStage('writer');
    $('recoveryDialog').close();
    if(writerId&&manifest.writers.some(w=>w.id===writerId))await chooseWriter(writerId);
    toast('Recovered library opened. This is a separate copy; your original USB files were not changed.');
  }catch(error){toast('Could not open recovery copy: '+error.message,true);}
}
const BACKUP_REMINDER_KEY='character-bookshelf-backup-reminder-v39';
const reminderShown=new Set();
let reminderFallback={};
function reminderState(){try{return JSON.parse(localStorage.getItem(BACKUP_REMINDER_KEY)||'{}');}catch{return structuredClone(reminderFallback);}}
function saveReminderState(next){reminderFallback=structuredClone(next);try{localStorage.setItem(BACKUP_REMINDER_KEY,JSON.stringify(next));}catch{}}
function writerReminderKey(){return (state.manifest?.createdAt||state.root?.name||'library')+'/'+(state.writer?.id||'writer');}
function backupReminderDays(){return reminderState()[writerReminderKey()]?.days??7;}
function setBackupReminderDays(days){const data=reminderState();const key=writerReminderKey();data[key]={...(data[key]||{}),days};saveReminderState(data);}
function recordBackupExport(){const data=reminderState(),key=writerReminderKey();data[key]={...(data[key]||{}),lastExportAt:dateNow()};saveReminderState(data);reminderShown.add(key);}
function maybeShowBackupReminder(){
  if(!state.writer)return;
  const key=writerReminderKey(),record=reminderState()[key]||{},days=record.days??7;
  if(!days||reminderShown.has(key))return;
  if(!record.lastExportAt||Date.now()-new Date(record.lastExportAt).getTime()>=days*86400000){
    reminderShown.add(key);
    toast('Backup reminder: consider exporting '+state.writer.name+'\'s writer ZIP to another device.');
  }
}
function renderReminderSettings(){
  const select=$('backupReminderDays');if(select){select.disabled=!state.writer;select.value=String(backupReminderDays());}
  const row=$('lastBackupExportLabel');if(row){
    const at=reminderState()[writerReminderKey()]?.lastExportAt;
    row.textContent=at?'Last download initiated: '+formatMoment(at):'No backup download recorded on this browser.';
  }
}

// One reversible action PER PAGE, held in this browser tab only. This is not a
// recovery system for permanently deleted USB files and is reset on browser reload.
const undoByPage = new Map();
let undoBusy = false, fieldFocusSerial = 0;
const NAV_KEY = 'character-bookshelf-navigation-v35';
function pageType() {
  if (!state.root) return 'folder';
  if ($('workspace').classList.contains('hidden')) return 'writers';
  for (const [id, kind] of [['bookshelfView','bookshelf'],['novelView','characters'],['treeView','tree'],['timelineView','timeline'],['librarySearchView','search'],['editor','editor']]) {
    if (!$(id).classList.contains('hidden')) return kind;
  }
  return 'bookshelf';
}
function pageUndoKey(kind = pageType()) {
  const library = state.manifest?.createdAt || state.root?.name || 'library';
  if (kind === 'writers') return library + '/writers';
  const writer = state.writer?.id || '-';
  if (kind === 'bookshelf' || kind === 'search') return [library,writer,kind].join('/');
  const novel = state.novel?.id || '-';
  if (kind === 'editor') return [library,writer,novel,'editor',state.active?.id || '-'].join('/');
  return [library,writer,novel,kind].join('/');
}
function updateUndoButton() {
  const button = $('undoBtn'); if (!button) return;
  const action = undoByPage.get(pageUndoKey());
  button.disabled = !action || undoBusy;
  button.title = action ? 'Undo on this page: ' + action.label : 'No reversible action on this page';
  button.textContent = action ? '↶ Undo: ' + action.label : '↶ Undo';
}
function clearUndo(scope = null) {
  if (scope) undoByPage.delete(scope);
  else undoByPage.clear();
  updateUndoButton();
}
function rememberUndo(label, rollback, group = null, scope = pageUndoKey()) {
  const old = undoByPage.get(scope);
  if (group && old?.group === group) return;
  undoByPage.set(scope, { label, rollback, group, scope });
  updateUndoButton();
}
async function undoLast() {
  const scope = pageUndoKey(), action = undoByPage.get(scope);
  if (!action || undoBusy) return;
  if (!(await flush())) { toast('Unable to undo until pending changes are saved.',true); return; }
  undoBusy = true; updateUndoButton();
  try {
    const ok = await action.rollback();
    if (ok === false) throw new Error('The USB update could not be completed.');
    if (undoByPage.get(scope) === action) undoByPage.delete(scope);
    toast('Undid: ' + action.label);
  } catch(error) {
    toast('Undo failed: ' + error.message + '. Check the USB files before retrying.',true);
  } finally { undoBusy = false; updateUndoButton(); }
}
function saveNavigation() {
  if (pageType() === 'folder' || pageType() === 'writers') return;
  try {
    sessionStorage.setItem(NAV_KEY, JSON.stringify({
      libraryCreatedAt: state.manifest?.createdAt || null,
      writerId: state.writer?.id || null,
      novelId: state.novel?.id || null,
      characterId: state.active?.id || null,
      view: pageType()
    }));
  } catch { /* Browser storage disabled: navigation works normally until refresh. */ }
}
function savedNavigation() {
  try { return JSON.parse(sessionStorage.getItem(NAV_KEY) || 'null'); }
  catch { return null; }
}
async function restoreNavigation(route) {
  if (!route?.writerId || !state.manifest?.writers.some(w => w.id === route.writerId)) return;
  if (route.libraryCreatedAt && state.manifest.createdAt !== route.libraryCreatedAt) return;
  await chooseWriter(route.writerId);
  if (route.view === 'search') { await showLibrarySearch(); return; }
  if (route.view === 'bookshelf') { await showBookshelf(); return; }
  if (!route.novelId || !state.novels.some(n => n.id === route.novelId)) return;
  await chooseNovel(route.novelId);
  if (route.view === 'tree') await showTree();
  else if (route.view === 'timeline') await showTimeline();
  else if (route.view === 'editor' && state.characters.some(c => c.id === route.characterId)) await chooseCharacter(route.characterId);
  else if (route.view === 'bookshelf') await showBookshelf();
  else if (route.view === 'search') await showLibrarySearch();
}
async function retryPendingWrites() {
  if(!memoryRecovery.pending.size)return;
  for(const [path,entry] of [...memoryRecovery.pending]) {
    const parts=path.split('/');let dir=state.root;
    for(const segment of parts.slice(0,-1))dir=await dir.getDirectoryHandle(segment);
    const handle=await dir.getFileHandle(parts.at(-1));
    // The version in RAM represents the last known-good original file. A
    // conflict during retry aborts the entire refresh and offers recovery.
    await writeHandle(handle,entry.bytes);
  }
}
async function refreshCurrentView() {
  if (!state.root || undoBusy) return;
  const refreshBtn = $('refreshViewBtn');
  refreshBtn.disabled = true;
  const page = pageType(), writerId = state.writer?.id, novelId = state.novel?.id, characterId = state.active?.id;
  const oldScope = pageUndoKey();
  try {
    // This is the IN-APP Refresh View button, not F5. Try saving pending edits
    // first, then reload only after all writes have been verified.
    if(typeof state.root.queryPermission==='function'&&await state.root.queryPermission({mode:'readwrite'})!=='granted'){
      if(await state.root.requestPermission({mode:'readwrite'})!=='granted')throw Error('Storage permission was not granted.');
    }
    if(!(await flush()))throw Error('Pending profile or tree edits could not be saved.');
    await retryPendingWrites();
    // Re-read the selected USB library rather than refreshing the entire website.
    memoryRecovery.refreshing=true;
    const manifest = await readJSON(await state.root.getFileHandle('character-archive-manifest.json'));
    validateManifest(manifest);
    state.manifest = manifest;
    renderWriterCards();
    if (page === 'writers') {
      setStage('writer');
    } else if (writerId && manifest.writers.some(w => w.id === writerId)) {
      await chooseWriter(writerId);
      if (page !== 'bookshelf' && novelId && state.novels.some(n => n.id === novelId)) {
        await chooseNovel(novelId);
        if (page === 'tree') await showTree();
        else if (page === 'timeline') await showTimeline();
        else if (page === 'editor' && characterId && state.characters.some(c => c.id === characterId)) await chooseCharacter(characterId);
      }
    } else {
      state.writer = null; state.writerDir = null; state.novels = []; clearNovelState();
      setStage('writer');
    }
    // A fresh read may have changed the target files; a stale Undo must not overwrite them.
    if (page === 'search') { await showLibrarySearch(); }
    if (page === 'bookshelf' || page === 'search') {
      for (const key of undoByPage.keys()) if (key.includes('/' + writerId + '/')) undoByPage.delete(key);
    } else if (novelId) {
      for (const key of undoByPage.keys()) if (key.includes('/' + novelId + '/')) undoByPage.delete(key);
    }
    undoByPage.delete(oldScope);
    updateUndoButton();
    memoryRecovery.lastFailure=null;memoryRecovery.disconnected=false;renderStorageStatus();
    memoryRecovery.refreshing=false;
    void captureRecoverySnapshot(); // reconcile other writers/files when possible
    status('Current view refreshed from USB');
    toast('Current view refreshed from USB. Undo for reloaded files was cleared.');
  } catch (error) {
    storageFailed(error);
    toast('Could not refresh this view: ' + error.message,true);
    recoveryOffer('Refresh could not access or safely update the original storage: '+error.message);
  } finally { memoryRecovery.refreshing=false;refreshBtn.disabled = false; }
}
function rememberFieldUndo(character,section,key,original,group,label) {
  rememberUndo(label || ('Edit '+ section + ' / ' + key), async () => {
    const current = state.characters.find(c=>c.id===character.id);
    if (!current) return false;
    current[section] ??= {};
    current[section][key] = original;
    if (section==='basic' && key==='fullName') current.name=original || 'Unnamed';
    // Save even when the edited character is not currently selected.
    if (state.active===current) { queueSave(); if (!(await flush())) return false; }
    else if (!(await persistTreeLink(current,structuredClone(current.relationships?.links || [])))) return false;
    if (!$('editor').classList.contains('hidden') && state.active===current) renderEditor();
    renderCharacterList();
    return true;
  },group);
}
function rememberLinksUndo(characters, oldLists, label, group = null) {
  const captured = characters.map(c=>({id:c.id,links:structuredClone(oldLists.get(c.id))}));
  rememberUndo(label,async () => {
    for (const item of captured) {
      const c=state.characters.find(x=>x.id===item.id);if(!c)return false;
      const rollback=structuredClone(c.relationships?.links||[]);
      c.relationships??={links:[],notes:''};c.relationships.links=structuredClone(item.links);
      if(!(await persistTreeLink(c,rollback)))return false;
    }
    if (!$('treeView').classList.contains('hidden')) renderTree();
    if (!$('editor').classList.contains('hidden') && state.active) renderEditor();
    return true;
  },group);
}

async function readJSON(handle) {
  const file = await handle.getFile();
  const bytes=new Uint8Array(await file.arrayBuffer());
  await rememberRead(handle,bytes);
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function putFile(directory, filename, content) {
  const handle = await directory.getFileHandle(filename, { create: true });
  await writeHandle(handle, content);
  return handle;
}
async function writeHandle(handle, content) {
  const bytes=await contentBytes(content),path=await recoveryPath(handle);
  const tracked=path!==null&&memoryRecovery.active;
  const baseline=tracked?memoryRecovery.files.get(path):null;
  try {
    // Compare with the original read to avoid overwriting changes made by another
    // computer or an external editor. Never silently replace a conflicting file.
    if(tracked&&baseline){
      const actual=new Uint8Array(await (await handle.getFile()).arrayBuffer());
      if(!sameBytes(actual,baseline)){
        const conflict=new Error('The file changed outside Character Bookshelf: '+path+'. Use recovery to save your version elsewhere.');
        conflict.name='StorageConflictError';throw conflict;
      }
    }
    const writer=await handle.createWritable();
    try{await writer.write(content);await writer.close();}
    catch(error){try{await writer.abort();}catch{}throw error;}
    // A successful close is not enough: read and compare byte-for-byte.
    const verified=new Uint8Array(await (await handle.getFile()).arrayBuffer());
    if(!sameBytes(verified,bytes))throw Error('Save verification failed: file contents differ after writing.');
    if(tracked){
      recoveryStore(path,verified,++memoryRecovery.writeSerial);
      memoryRecovery.pending.delete(path);
    }
    memoryRecovery.lastVerified=dateNow();memoryRecovery.lastFailure=null;
    memoryRecovery.disconnected=false;renderStorageStatus();
  }catch(error){
    if(tracked)memoryRecovery.pending.set(path,{bytes:bytes.slice(),reason:error.message});
    storageFailed(error);
    throw error;
  }
}
async function putJSON(directory, filename, data) {
  return putFile(directory, filename, JSON.stringify(data, null, 2) + '\n');
}
function diskProfile(character) {
  return JSON.parse(JSON.stringify(character, (key, value) => key.startsWith('_') ? undefined : value));
}
function hasUnsaved() { return state.revision > state.savedRevision; }
function queueSave() {
  if (!state.active) return;
  state.revision++;
  status('Unsaved changes', 'busy');
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => { void flush(); }, 700);
}

/* Profile snapshots are regular JSON files on the selected USB library.
   Keep up to 12 timestamped versions, no more than one automatic snapshot
   per 15 minutes. An explicit restore always protects the current copy. */
const REVISION_GAP_MS = 15 * 60 * 1000;
async function revisionFolder(character, create = false) {
  if (!state.novelDir) throw new Error('No novel open.');
  let root;
  try { root = await state.novelDir.getDirectoryHandle('revisions', {create}); }
  catch(e){ if(!create && e.name==='NotFoundError')return null;throw e; }
  try { return await root.getDirectoryHandle(character.id, {create}); }
  catch(e){ if(!create && e.name==='NotFoundError')return null;throw e; }
}
async function listRevisions(character) {
  const directory = await revisionFolder(character);
  if(!directory)return [];
  const out=[];
  for await (const [name, entry] of directory.entries()) {
    if(entry.kind!=='file'||!name.endsWith('.json'))continue;
    out.push({name,handle:entry,stamp:name.slice(0,-5)});
  }
  return out.sort((a,b)=>b.name.localeCompare(a.name));
}
async function saveRevisionBeforeChange(character, force=false) {
  const existing=await listRevisions(character);
  const latest=existing[0];
  if(!force && latest) {
    const stamp = Date.parse(latest.stamp.slice(0,24).replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/,'T$1:$2:$3.$4Z'));
    // Filenames use a safe ISO-like stamp and are comparable as strings.
    if(Number.isFinite(stamp) && Date.now()-stamp<REVISION_GAP_MS)return;
  }
  const disk=await readJSON(character._handle);
  const current=JSON.stringify(diskProfile(character));
  if(!force && JSON.stringify(disk)===current)return;
  const dir=await revisionFolder(character,true);
  const stamp=dateNow().replace(/[:.]/g,'-').replace(/Z$/,'Z');
  const safeStamp=stamp+'-'+Math.random().toString(36).slice(2,7);
  await putJSON(dir,safeStamp+'.json',disk);
  const all=await listRevisions(character);
  for(const old of all.slice(12)) {
    try{await removeTrackedEntry(dir,old.name);}catch(e){console.warn('Could not prune old revision',e);}
  }
}
async function showRevisionHistory() {
  const character=state.active;
  if(!character || !(await flush()))return;
  const dialog=$('revisionHistoryDialog'),host=$('revisionHistoryList');host.replaceChildren();
  const list=await listRevisions(character);
  if(!list.length)host.append(el('p','muted','No previous versions yet. A revision is saved before the next profile edit and periodically afterward.'));
  for(const entry of list){
    const row=el('div','revisionRow');
    row.append(el('strong','',revisionLabel(entry)));
    const preview=el('button','quiet','Preview');preview.type='button';
    preview.onclick=async()=>{try{const old=await readJSON(entry.handle);window.alert(JSON.stringify(old,null,2).slice(0,14000));}catch(e){toast('Could not read revision: '+e.message,true);}};
    const restore=el('button','quiet','Restore');restore.type='button';
    restore.onclick=async()=>{
      if(!confirm('Restore this earlier character profile? A backup of your current profile will be created first.'))return;
      try{
        const old=await readJSON(entry.handle);
        if(old.id!==character.id)throw Error('Revision belongs to a different character.');
        await saveRevisionBeforeChange(character,true);
        const handle=character._handle,filename=character._filename;
        for(const key of Object.keys(character))if(!key.startsWith('_'))delete character[key];
        Object.assign(character,old,{_handle:handle,_filename:filename});
        state.active=character;queueSave();
        if(!(await flush()))throw Error('Save failed; do not close this tab.');
        dialog.close();renderEditor();toast('Earlier character revision restored.');
      }catch(e){toast('Restore failed: '+e.message,true);}
    };
    const compare=el('button','quiet','Compare');compare.type='button';
    compare.onclick=()=>void showRevisionComparison(entry.name);
    row.append(preview,compare,restore);host.append(row);
  }
  dialog.showModal();
}

async function showRevisionComparison(initialName=null) {
  if(!state.active || !(await flush()))return;
  const entries=await listRevisions(state.active);
  if(!entries.length){toast('No earlier versions to compare yet.',true);return;}
  const left=$('compareRevisionLeft'),right=$('compareRevisionRight');left.replaceChildren();right.replaceChildren();
  const options=[{name:'current',label:'Current saved profile'},...entries.map(e=>({name:e.name,label:revisionLabel(e)}))];
  for(const item of options){left.add(new Option(item.label,item.name));right.add(new Option(item.label,item.name));}
  left.value=initialName||entries[0].name;right.value='current';
  $('revisionCompareDialog').showModal();
  await renderRevisionComparison();
}
function revisionLabel(entry) {
  const match=entry.stamp.match(/^(\d{4}-\d\d-\d\d)T(\d\d)-(\d\d)-(\d\d)-(\d{3})Z/);
  if(!match)return entry.stamp;
  const iso=match[1]+'T'+match[2]+':'+match[3]+':'+match[4]+'.'+match[5]+'Z';
  return formatMoment(iso);
}
let revisionCompareToken = 0;
async function renderRevisionComparison() {
  const token=++revisionCompareToken;
  const character=state.active;
  if(!character)return;
  const host=$('revisionCompareBody');host.replaceChildren(el('p','muted','Reading saved revisions…'));
  try{
    const list=await listRevisions(character);
    const read=async name=>name==='current'?readJSON(character._handle):readJSON((list.find(e=>e.name===name)||(() => {throw Error('Revision not found.');})()).handle);
    const [older,newer]=await Promise.all([read($('compareRevisionLeft').value),read($('compareRevisionRight').value)]);
    if(token!==revisionCompareToken || !$('revisionCompareDialog').open)return;
    if(older.id!==character.id||newer.id!==character.id)throw Error('Selected revision belongs to another character.');
    host.replaceChildren();
    const metadata=[['Record','Date created',older.createdAt,newer.createdAt],['Record','Last updated',older.updatedAt,newer.updatedAt]];
    for(const [section,title,fields] of IMPORT_FIELDS) for(const [key,label] of fields) metadata.push([title,label,older[section]?.[key],newer[section]?.[key]]);
    // Relationship IDs and portrait metadata remain visible, but are never altered by a comparison.
    metadata.push(['Relationships','Linked characters (IDs)',JSON.stringify(older.relationships?.links||[]),JSON.stringify(newer.relationships?.links||[])]);
    metadata.push(['Basic Information','Portrait file',older.portraitFile,newer.portraitFile]);
    let changed=0;
    for(const [section,label,a,b] of metadata){
      const old=String(a??''),next=String(b??'');if(old===next)continue;
      changed++;
      const row=el('div','revisionDifference');row.append(el('strong','',section+' · '+label));
      const pair=el('div','revisionPair');
      const one=el('div');one.append(el('span','muted','Left'),el('pre','',old||'(blank)'));
      const two=el('div');two.append(el('span','muted','Right'),el('pre','',next||'(blank)'));
      pair.append(one,two);row.append(pair);host.append(row);
    }
    if(!changed)host.append(el('p','muted','The selected versions have no differences in their profile fields or timestamps.'));
  }catch(e){if(token===revisionCompareToken)host.replaceChildren(el('p','errorText','Could not compare revisions: '+e.message));}
}
async function flushProfile() {
  clearTimeout(state.saveTimer);
  state.saveTimer = null;
  if (state.saving) return state.saving;
  if (!state.active || !hasUnsaved()) return true;
  const character = state.active;
  const epoch = state.epoch;
  state.saving = (async () => {
    while (state.revision > state.savedRevision) {
      const revision = state.revision;
      const now = dateNow();
      const snapshot = diskProfile({ ...character, updatedAt: now });
      try {
        status('Saving to USB…', 'busy');
        // Editing and then reverting to the saved values is not a new revision.
        const saved=await readJSON(character._handle);
        if(JSON.stringify(saved)===JSON.stringify(diskProfile(character))){
          state.savedRevision=revision;
          continue;
        }
        await saveRevisionBeforeChange(character);
        await writeHandle(character._handle, JSON.stringify(snapshot, null, 2) + '\n');
        state.savedRevision = revision;
        character.updatedAt = now;
        if (state.active === character && epoch === state.epoch) {
          $('lastSavedLabel').textContent = 'Saved ' + new Date(now).toLocaleString();
          const updatedValue=document.querySelector('[data-profile-updated-for="'+character.id+'"]');
          if(updatedValue)updatedValue.textContent=formatMoment(now);
        }
      } catch (error) {
        const path=await recoveryPath(character._handle);
        if(path!==null)memoryRecovery.pending.set(path,{bytes:encoder.encode(JSON.stringify(snapshot,null,2)+'\n'),reason:error.message});
        storageFailed(error);
        status('Save failed — changes not saved', 'bad');
        $('retrySaveBtn').classList.remove('hidden');
        $('downloadUnsavedBtn').classList.remove('hidden');
        toast('Could not write to the selected folder: ' + error.message + '. Keep this tab open and reconnect the USB if needed.', true);
        return false;
      }
    }
    status('Saved to folder');
    $('retrySaveBtn').classList.add('hidden');
    $('downloadUnsavedBtn').classList.add('hidden');
    return true;
  })();
  try { return await state.saving; }
  finally { state.saving = null; }
}
async function flush() {
  const profileOk = await flushProfile();
  if (!profileOk) return false;
  return flushTree();
}
function setStage(stage) {
  $('startup').classList.toggle('hidden', stage === 'workspace');
  $('folderStep').classList.toggle('hidden', stage !== 'folder');
  $('writerStep').classList.toggle('hidden', stage !== 'writer');
  $('workspace').classList.toggle('hidden', stage !== 'workspace');
  $('backupBtn').classList.toggle('hidden', !state.root);
  $('storageStatusBtn').classList.toggle('hidden', !state.root);
  $('topSwitchWriterBtn').classList.toggle('hidden', stage !== 'workspace');
  $('changeFolderBtn').classList.toggle('hidden', !state.root);
  $('refreshViewBtn').classList.toggle('hidden', stage !== 'workspace');
  $('globalSearchBtn').classList.toggle('hidden', stage !== 'workspace');
  updateUndoButton();
}
function clearNovelState() {
  state.novel = null; state.novelDir = null; state.charsDir = null; state.portraitsDir = null;
  state.characters = []; state.active = null; state.revision = 0; state.savedRevision = 0;
  state.epoch++;
  clearTimeout(state.treeTimer); state.treeTimer=null; state.treeMeta=null;
  state.treeRevision=0; state.treeSavedRevision=0; state.treeSaving=null;
  state.timelineEvents = []; state.timelineFilter = 'all';
  cleanPortraitUrl(); cleanGalleryUrls(); cleanCoverUrls();
}

function clearRootState() {
  memoryRecovery.scanId++; memoryRecovery.active=false;
  clearUndo();
  state.root = null; state.selectedLocation = null; state.manifest = null; state.writer = null; state.writerDir = null;
  state.novels = []; clearNovelState();
}
async function askName(title, label, hint = '') {
  const dialog = $('nameDialog');
  $('nameDialogTitle').textContent = title;
  $('nameDialogLabel').textContent = label;
  $('nameDialogHint').textContent = hint;
  $('nameInput').value = '';
  return new Promise(resolve => {
    const form = $('nameForm');
    const onSubmit = event => {
      event.preventDefault();
      const value = cleanName($('nameInput').value);
      if (!value) return;
      dialog.close('ok');
    };
    const onCancel = () => dialog.close('cancel');
    const onClose = () => {
      form.removeEventListener('submit', onSubmit);
      $('cancelNameBtn').removeEventListener('click', onCancel);
      dialog.removeEventListener('close', onClose);
      resolve(dialog.returnValue === 'ok' ? cleanName($('nameInput').value) : null);
    };
    form.addEventListener('submit', onSubmit);
    $('cancelNameBtn').addEventListener('click', onCancel);
    dialog.addEventListener('close', onClose);
    dialog.showModal();
    $('nameInput').focus();
  });
}
/* Pick a parent location, then open/create Character Bookshelf inside it.
   Existing Character Archive libraries are opened in place, with their files and
   manifest schema unchanged, so renaming the app never strands existing work. */
async function resolveLibraryLocation(selected) {
  let root = selected;
  let existing = false;
  // An explicitly chosen library (new or legacy) always wins.
  try {
    const file = await selected.getFileHandle('character-archive-manifest.json');
    const manifest = await readJSON(file);
    validateManifest(manifest);
    return { root: selected, manifest, existing: true, direct: true };
  } catch (error) {
    if (error.name !== 'NotFoundError') throw error;
  }
  const newName = 'Character Bookshelf';
  const legacyName = 'Character Archive';
  const selectionIsLibrary = [newName, legacyName].some(name =>
    selected.name.toLowerCase() === name.toLowerCase());
  if (!selectionIsLibrary) {
    async function findChild(name) {
      try { return await selected.getDirectoryHandle(name); }
      catch (error) { if (error.name === 'NotFoundError') return null; throw error; }
    }
    const newFolder = await findChild(newName);
    const legacyFolder = await findChild(legacyName);
    if (newFolder && legacyFolder) {
      throw new Error('Both Character Bookshelf and Character Archive folders were found. Select the one you want directly so the app does not open the wrong library.');
    }
    root = newFolder || legacyFolder || await selected.getDirectoryHandle(newName, { create: true });
  }
  let manifest;
  try {
    manifest = await readJSON(await root.getFileHandle('character-archive-manifest.json'));
    validateManifest(manifest);
    existing = true;
  } catch (error) {
    if (error.name !== 'NotFoundError') throw error;
    // Never silently initialize a folder that already contains files or folders.
    for await (const _entry of root.entries()) {
      throw new Error('The selected application folder contains files but no valid library manifest. Nothing was changed. Back up and inspect this folder first.');
    }
    // Retain the established manifest schema for compatibility with older versions.
    manifest = { type: 'character-archive', version: 1, createdAt: dateNow(), writers: [] };
    await putJSON(root, 'character-archive-manifest.json', manifest);
  }
  return { root, manifest, existing, direct: selected === root };
}
function validateManifest(manifest) {
  if (!manifest || manifest.type !== 'character-archive' || !Array.isArray(manifest.writers)) {
    throw new Error('The selected library manifest is invalid. No existing files were changed.');
  }
}
async function selectFolder() {
  $('folderError').classList.add('hidden');
  if (!window.isSecureContext || typeof window.showDirectoryPicker !== 'function') {
    $('folderError').textContent = 'Folder access is unavailable. Open this application in current Chrome or Edge using its HTTPS GitHub Pages address (or localhost).';
    $('folderError').classList.remove('hidden');
    return;
  }
  if (hasUnsaved() || state.saving || treeUnsaved() || state.treeSaving) {
    toast('Finish saving before changing folders. Click Select folder again after it says Saved.', true);
    void flush();
    return;
  }
  try {
    const selected = await window.showDirectoryPicker({ mode: 'readwrite' });
    if (typeof selected.queryPermission === 'function' && await selected.queryPermission({ mode: 'readwrite' }) !== 'granted') {
      if (await selected.requestPermission({ mode: 'readwrite' }) !== 'granted') {
        toast('Folder write permission was not granted.', true); return;
      }
    }
    const { root, manifest, existing } = await resolveLibraryLocation(selected);
    const routeToRestore = savedNavigation();
    clearRootState();
    state.root = root;
    state.selectedLocation = selected;
    state.manifest = manifest;
    beginVolatileRecovery();
    $('folderName').textContent = root.name + (selected === root ? ' (existing library)' : ' (inside ' + selected.name + ')');
    $('retrySaveBtn').classList.add('hidden');
    $('downloadUnsavedBtn').classList.add('hidden');
    status(existing ? 'Existing library opened' : 'Character Bookshelf folder created');
    renderWriterCards();
    setStage('writer');
    toast(existing ? 'Existing library opened: ' + root.name + '.' : 'Created the Character Bookshelf folder.');
    if (routeToRestore) await restoreNavigation(routeToRestore);
  } catch (error) {
    if (error.name === 'AbortError') return;
    $('folderError').textContent = 'Cannot open folder: ' + error.message;
    $('folderError').classList.remove('hidden');
    toast('Folder access failed: ' + error.message, true);
  }
}

function renderWriterCards() {
  const host = $('writerGrid'); host.replaceChildren();
  for (const writer of state.manifest?.writers || []) {
    const button = el('button', 'writerCard'); button.type = 'button';
    button.append(el('span', 'writerAvatar', writer.name.slice(0,1).toUpperCase()), el('span', '', writer.name));
    button.addEventListener('click', () => void chooseWriter(writer.id));
    const tile=el('div','writerTile');
    const del=el('button','writerDelete','Delete');del.type='button';del.title='Delete '+writer.name+' and all of their books';
    del.setAttribute('aria-label','Delete writer '+writer.name);
    del.onclick=()=>void deleteWriter(writer.id);
    tile.append(button,del);host.append(tile);
  }
}
async function createWriter() {
  const name = await askName('Create writer profile', 'Writer name');
  if (!name) return;
  if (state.manifest.writers.some(w => w.name.toLowerCase() === name.toLowerCase())) {
    toast('That writer already exists.', true); return;
  }
  const folders = state.manifest.writers.map(w => w.folder.toLowerCase());
  let folder = folderSafe(name), index = 2;
  while (folders.includes(folder.toLowerCase())) folder = folderSafe(name) + '-' + index++;
  const writer = { id: randomId(), name, folder };
  try {
    await state.root.getDirectoryHandle(folder, { create: true });
    const manifest = { ...state.manifest, writers: [...state.manifest.writers, writer] };
    await putJSON(state.root, 'character-archive-manifest.json', manifest);
    state.manifest = manifest;
    renderWriterCards();
    await chooseWriter(writer.id);
    rememberUndo('Create writer', async () => {
      if (state.novels.length) return false;
      // Refuse to undo writer creation if anything was added to its folder.
      const folderHandle=await state.root.getDirectoryHandle(folder);
      for await (const _item of folderHandle.entries()) return false;
      await removeTrackedEntry(state.root,folder);
      const next={...state.manifest,writers:state.manifest.writers.filter(x=>x.id!==writer.id)};
      await putJSON(state.root,'character-archive-manifest.json',next);
      state.manifest=next;state.writer=null;state.writerDir=null;state.novels=[];clearNovelState();
      renderWriterCards();setStage('writer');return true;
    }, null, pageUndoKey('writers'));
  } catch (error) { toast('Could not create writer: ' + error.message, true); }
}
async function deleteWriter(id) {
  if(deleteInProgress || pageType()!=='writers' || !state.root || !state.manifest)return;
  const writer=state.manifest.writers.find(w=>w.id===id);if(!writer)return;
  const dialog=$('deleteWriterDialog'),input=$('deleteWriterConfirmInput');
  $('deleteWriterName').textContent=writer.name;
  input.value='';$('confirmDeleteWriterBtn').disabled=true;
  const onInput=()=>{$('confirmDeleteWriterBtn').disabled=input.value.trim()!==writer.name;};
  input.addEventListener('input',onInput);dialog.showModal();input.focus();
  const approved=await new Promise(resolve=>{
    let accepted=false;
    const yes=()=>{accepted=true;dialog.close();};
    const no=()=>dialog.close();
    const closed=()=>{
      input.removeEventListener('input',onInput);
      $('confirmDeleteWriterBtn').removeEventListener('click',yes);
      $('cancelDeleteWriterBtn').removeEventListener('click',no);
      dialog.removeEventListener('close',closed);
      resolve(accepted&&input.value.trim()===writer.name);
    };
    $('confirmDeleteWriterBtn').addEventListener('click',yes);
    $('cancelDeleteWriterBtn').addEventListener('click',no);
    dialog.addEventListener('close',closed);
  });
  if(!approved)return;
  if(!(await flush())){toast('Writer deletion canceled: pending changes could not be saved.',true);return;}
  deleteInProgress=true;
  try {
    const live=await readJSON(await state.root.getFileHandle('character-archive-manifest.json'));
    validateManifest(live);
    if(JSON.stringify(live)!==JSON.stringify(state.manifest))throw Error('The writer list changed on disk. Refresh before deleting.');
    if(!live.writers.some(w=>w.id===writer.id&&w.folder===writer.folder))throw Error('The writer could not be matched safely.');
    status('Deleting writer…','busy');
    // The folder must be removed first. If deletion is interrupted, explicitly
    // report that the writer may be partially deleted; never claim success.
    await removeTrackedEntry(state.root,writer.folder,{recursive:true});
    const next={...live,writers:live.writers.filter(w=>w.id!==writer.id)};
    await putJSON(state.root,'character-archive-manifest.json',next);
    state.manifest=next;renderWriterCards();clearUndo();
    status('Writer removed');toast('Writer and their entire library deleted.');
  }catch(error){storageFailed(error);memoryRecovery.complete=false;memoryRecovery.partialReason='Writer deletion may have been interrupted; inspect USB files';status('Writer deletion needs inspection','bad');
    toast('Writer deletion did not finish safely: '+error.message+'. Check the USB folder before retrying.',true);
  }finally{deleteInProgress=false;}
}

async function chooseWriter(id) {
  if (!(await flush())) { toast('Save your changes before switching writers.', true); return; }
  const writer = state.manifest.writers.find(w => w.id === id);
  if (!writer) return;
  try {
    const directory = await state.root.getDirectoryHandle(writer.folder);
    const novels = [];
    for await (const [folderName, handle] of directory.entries()) {
      if (handle.kind !== 'directory') continue;
      try {
        const novel = await readJSON(await handle.getFileHandle('novel.json'));
        if (novel.type === 'character-archive-novel') novels.push({ ...novel, folder: folderName });
      } catch (error) { if (error.name !== 'NotFoundError') throw error; }
    }
    state.writer = writer; state.writerDir = directory; state.novels = novels.sort((a,b) => a.name.localeCompare(b.name));
    clearNovelState();
    $('currentWriter').textContent = writer.name;
    $('writerInitial').textContent = writer.name.slice(0,1).toUpperCase();
    renderNovelSelect(); renderCharacterList();
    setStage('workspace');
    status('Library ready');
    await showBookshelf();
    maybeShowBackupReminder();
  } catch (error) { toast('Could not open writer: ' + error.message, true); }
}
function renderNovelSelect() {
  const select = $('novelSelect'); select.replaceChildren();
  select.add(new Option(state.novels.length ? 'Choose a novel…' : 'No novels yet', ''));
  for (const novel of state.novels) select.add(new Option(novel.name, novel.id));
  select.value = state.novel?.id || '';
  $('novelCharactersBtn').disabled = !state.novel;
}
async function createNovel() {
  const name = await askName('Create a novel', 'Novel title');
  if (!name) return;
  if (state.novels.some(n => n.name.toLowerCase() === name.toLowerCase())) {
    toast('That novel already exists for this writer.', true); return;
  }
  const folders = state.novels.map(n => n.folder.toLowerCase());
  let folder = folderSafe(name), index = 2;
  while (folders.includes(folder.toLowerCase())) folder = folderSafe(name) + '-' + index++;
  try {
    const directory = await state.writerDir.getDirectoryHandle(folder, { create: true });
    await directory.getDirectoryHandle('characters', { create: true });
    await directory.getDirectoryHandle('portraits', { create: true });
    const novel = { type: 'character-archive-novel', id: randomId(), name, folder, createdAt: dateNow() };
    await putJSON(directory, 'novel.json', novel);
    state.novels.push(novel); state.novels.sort((a,b) => a.name.localeCompare(b.name));
    await chooseNovel(novel.id);
    rememberUndo('Create book', async () => {
      if (state.characters.length) return false;
      const novelDir=await state.writerDir.getDirectoryHandle(novel.folder);
      for await (const [name,entry] of novelDir.entries()) {
        if (name==='novel.json' && entry.kind==='file') continue;
        if (['characters','portraits'].includes(name) && entry.kind==='directory') {
          for await (const _nested of entry.entries()) return false;
          continue;
        }
        return false; // Do not delete unfamiliar files via Undo.
      }
      await removeTrackedEntry(novelDir,'novel.json');
      await removeTrackedEntry(novelDir,'characters');
      await removeTrackedEntry(novelDir,'portraits');
      await removeTrackedEntry(state.writerDir,novel.folder);
      state.novels=state.novels.filter(x=>x.id!==novel.id);clearNovelState();
      renderNovelSelect();await showBookshelf();return true;
    }, null, pageUndoKey('bookshelf'));
    toast('Novel created.');
  } catch (error) { toast('Could not create novel: ' + error.message, true); }
}
async function chooseNovel(id) {
  if (!(await flush())) { toast('Save your changes before switching novels.', true); renderNovelSelect(); return; }
  const novel = state.novels.find(n => n.id === id);
  if (!novel) return;
  try {
    const directory = await state.writerDir.getDirectoryHandle(novel.folder);
    const charsDir = await directory.getDirectoryHandle('characters', { create: true });
    const portraitsDir = await directory.getDirectoryHandle('portraits', { create: true });
    const treeMeta = await loadTreeMeta(directory);
    const timelineEvents = await loadTimelineEvents(directory);
    const characters = [];
    for await (const [filename, handle] of charsDir.entries()) {
      if (handle.kind !== 'file' || !filename.toLowerCase().endsWith('.json')) continue;
      const profile = await readJSON(handle);
      if (typeof profile.id !== 'string' || !profile.id || typeof profile.name !== 'string') {
        throw new Error('Invalid character profile: ' + filename);
      }
      profile._handle = handle;
      profile._filename = filename;
      characters.push(profile);
    }
    clearNovelState();
    state.novel = novel; state.novelDir = directory; state.charsDir = charsDir; state.portraitsDir = portraitsDir;
    state.characters = characters.sort((a,b) => a.name.localeCompare(b.name));
    state.treeMeta = treeMeta; state.timelineEvents = timelineEvents;
    renderNovelSelect(); renderCharacterList();
    await showCharacters();
    status('Library ready');
  } catch (error) { toast('Could not open novel: ' + error.message, true); renderNovelSelect(); }
}
function blankCharacter(name) {
  const now = dateNow();
  return {
    schema: 1, id: randomId(), name, createdAt: now, updatedAt: now, portraitFile: null,
    basic: { fullName: name, age: '', occupation: '', appearance: '', notes: '' },
    personality: { traits: '', fears: '', beliefs: '', motivations: '', notes: '' },
    background: { history: '', experiences: '', notes: '' },
    relationships: { links: [], notes: '' },
    story: { role: '', timeline: '', events: '', notes: '' },
    freeform: { notes: '' }
  };
}
async function createCharacter() {
  if (!state.novel) return;
  if (!(await flush())) return;
  const name = await askName('Create character', 'Character name', 'All six sections start blank except the character name.');
  if (!name) return;
  const character = blankCharacter(name);
  const fileName = folderSafe(name) + '--' + character.id.slice(0,8) + '.json';
  try {
    const handle = await putJSON(state.charsDir, fileName, character);
    character._handle = handle; character._filename = fileName;
    state.characters.push(character);
    state.characters.sort((a,b) => a.name.localeCompare(b.name));
    await chooseCharacter(character.id);
    rememberUndo('Create character',async () => {
      if (!state.characters.some(x=>x.id===character.id)) return false;
      await removeTrackedEntry(state.charsDir,character._filename);
      state.characters=state.characters.filter(x=>x.id!==character.id);
      if(state.active?.id===character.id)state.active=null;
      await showCharacters();renderCharacterList();return true;
    }, null, pageUndoKey('characters'));
    toast('Character created and saved to the selected folder.');
  } catch (error) { toast('Could not create character: ' + error.message, true); }
}
function renderCharacterList() {
  const host = $('characterList'); host.replaceChildren();
  const search = $('searchInput').value.trim().toLowerCase();
  const chars = state.characters.filter(c => c.name.toLowerCase().includes(search));
  $('characterCount').textContent = String(state.characters.length);
  for (const character of chars) {
    const button = el('button', 'characterItem' + (state.active?.id === character.id ? ' active' : ''));
    button.type = 'button';
    button.append(el('span','mini',character.name[0]?.toUpperCase() || '?'),el('span','cut',character.name));
    button.addEventListener('click', () => void chooseCharacter(character.id));
    host.append(button);
  }
  if (!chars.length) host.append(el('p','emptyList', search ? 'No matching characters.' : 'No characters yet.'));
  $('newCharacterBtn').disabled = !state.novel;
}
function hideMainViews() {
  for (const id of ['bookshelfView', 'novelView', 'treeView', 'timelineView', 'librarySearchView', 'emptyView', 'editor']) $(id).classList.add('hidden');
}
function cleanGalleryUrls() {
  for (const url of state.galleryUrls) URL.revokeObjectURL(url);
  state.galleryUrls = [];
}
function makeBook(novel, index) {
  const tile = el('div', 'bookTile');
  const button = el('button', 'bookCover bookVariant' + (index % 6));
  button.type = 'button';
  button.setAttribute('aria-label', 'Open ' + novel.name + ' characters');
  const cover = el('span','bookFront');
  cover.append(el('span', 'bookOrnament', '✦'), el('span','bookTitle',novel.name), el('span','bookFooter','CHARACTER COLLECTION'));
  button.append(cover);
  if (novel.coverFile) void showBookCover(novel,cover);
  button.addEventListener('click', () => void chooseNovel(novel.id));
  const remove = el('button', 'bookDeleteBtn', '×');
  remove.type = 'button';
  remove.title = 'Delete book: ' + novel.name;
  remove.setAttribute('aria-label', 'Delete book ' + novel.name);
  remove.addEventListener('click', () => void deleteBook(novel.id));
  tile.append(button, remove);
  return tile;
}
async function showBookshelf() {
  if (!(await flush())) { toast('Please save your changes before returning to your bookshelf.', true); return; }
  if (!state.writer) return;
  hideMainViews();
  cleanGalleryUrls();cleanCoverUrls();
  $('bookshelfView').classList.remove('hidden');
  $('shelfTitle').textContent = state.writer.name + "'s Bookshelf";
  $('shelfSubtitle').textContent = state.novels.length ?
    'Choose a novel to explore its characters.' : 'Your shelves are empty. Add a novel to begin.';
  const container = $('shelfBooks'); container.replaceChildren();
  if (!state.novels.length) {
    const empty = el('div', 'noBooks');
    empty.append(el('span', 'bigGlyph','▤'), el('p','', 'Your first book belongs here.'));
    container.append(empty);
  } else {
    for (let start = 0; start < state.novels.length; start += 5) {
      const shelf = el('div','bookShelf');
      const books = el('div','bookShelfRow');
      state.novels.slice(start, start+5).forEach((novel, offset) => books.append(makeBook(novel,start+offset)));
      shelf.append(books, el('div','shelfPlank'));
      container.append(shelf);
    }
  }
  setActiveSidebarNavigation('bookshelf');
  setWorkspaceView('bookshelf');
  void renderRecentlyWorkedOn();
}
async function renderRecentlyWorkedOn() {
  const host=$('recentCharacters');host.replaceChildren(el('p','muted','Checking saved characters…'));
  const writerId=state.writer?.id, results=[];
  if(!writerId)return;
  try {
    for(const novel of state.novels){
      const bookDir=await state.writerDir.getDirectoryHandle(novel.folder);
      let dir;try{dir=await bookDir.getDirectoryHandle('characters');}catch(e){if(e.name==='NotFoundError')continue;throw e;}
      for await(const [name,entry] of dir.entries()){
        if(entry.kind!=='file'||!name.toLowerCase().endsWith('.json'))continue;
        const profile=await readJSON(entry);
        if(profile.updatedAt && Number.isFinite(Date.parse(profile.updatedAt))) results.push({profile,novel});
      }
    }
    if(state.writer?.id!==writerId || pageType()!=='bookshelf')return;
    results.sort((a,b)=>Date.parse(b.profile.updatedAt)-Date.parse(a.profile.updatedAt));
    host.replaceChildren();
    if(!results.length){host.append(el('p','muted','No saved update dates yet. Character updates will appear here.'));return;}
    for(const {profile,novel} of results.slice(0,6)){
      const btn=el('button','recentCharacter');btn.type='button';
      btn.append(el('strong','',profile.name),el('span','muted',novel.name),el('small','',formatMoment(profile.updatedAt)));
      btn.onclick=async()=>{await chooseNovel(novel.id);await chooseCharacter(profile.id);};
      host.append(btn);
    }
  }catch(e){if(state.writer?.id===writerId && pageType()==='bookshelf')host.replaceChildren(el('p','errorText','Recently updated characters could not load: '+e.message));}
}
async function showCharacters() {
  if (!(await flush())) { toast('Please save your changes before viewing all characters.', true); return; }
  if (!state.novel) { await showBookshelf(); return; }
  hideMainViews();
  $('novelView').classList.remove('hidden');
  $('novelViewTitle').textContent = state.novel.name;
  $('novelViewSubtitle').textContent = 'Browse all characters in this novel.';
  $('novelViewKicker').textContent = state.writer.name.toUpperCase() + ' / NOVEL';
  $('novelCharacterCount').textContent = String(state.characters.length);
  $('removeCoverBtn').disabled=!state.novel.coverFile;
  const host = $('characterGallery');
  cleanGalleryUrls(); host.replaceChildren();
  const sort=$('gallerySort').value;
  const sortedCharacters=[...state.characters].sort((a,b)=>sort==='updated'? ((Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0)) || a.name.localeCompare(b.name) : sort==='newest'?((Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0)) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
  if (!state.characters.length) {
    const empty = el('div','noCharacters');
    empty.append(el('span','bigGlyph','♟'), el('h3','', 'No characters yet'), el('p','', 'Create a character to start this novel’s collection.'));
    host.append(empty);
  }
  const epoch = state.epoch;
  for (const character of sortedCharacters) {
    const tile = el('div','characterTile');
    const button = el('button','characterCard'); button.type='button';
    const frame = el('span','galleryPortrait');
    frame.append(el('span','gallerySilhouette','♟'));
    const body = el('span','galleryBody');
    body.append(el('span','galleryName', character.name));
    const role = character.story?.role?.trim();
    if (role) body.append(el('span','galleryRole',role));
    body.append(el('span','galleryUpdated',character.updatedAt && Number.isFinite(Date.parse(character.updatedAt)) ? 'Updated ' + new Date(character.updatedAt).toLocaleDateString() : 'Update date not recorded'));
    button.append(frame,body);
    button.addEventListener('click',()=> void chooseCharacter(character.id));
    const remove = el('button', 'characterDeleteBtn', '×');
    remove.type = 'button';
    remove.title = 'Delete character: ' + character.name;
    remove.setAttribute('aria-label', 'Delete character ' + character.name);
    remove.addEventListener('click', () => void deleteCharacter(character.id));
    tile.append(button, remove);
    host.append(tile);
    if (character.portraitFile && state.portraitsDir) {
      // Portraits are optional. A missing file leaves the silhouette in place.
      void (async()=>{
        try {
          const file = await (await state.portraitsDir.getFileHandle(character.portraitFile)).getFile();
          if (epoch !== state.epoch || $('novelView').classList.contains('hidden') || !button.isConnected) return;
          const url = URL.createObjectURL(file);
          state.galleryUrls.push(url);
          const img = el('img'); img.src=url; img.alt='';
          frame.replaceChildren(img);
        } catch { /* optional portrait unavailable */ }
      })();
    }
  }
  setActiveSidebarNavigation('characters');
  setWorkspaceView('characters');
}
function setWorkspaceView(view) {
  $('workspace').classList.toggle('galleryMode', view !== 'editor');
  $('workspace').classList.toggle('editorMode', view === 'editor');
  updateUndoButton();
  saveNavigation();
}
function setActiveSidebarNavigation(view) {
  $('bookshelfBtn').classList.toggle('navSelected',view==='bookshelf');
  $('novelCharactersBtn').classList.toggle('navSelected',view==='characters');
}
function renderEmpty() {
  hideMainViews(); $('emptyView').classList.remove('hidden');
  if (!state.novel) {
    $('emptyTitle').textContent = 'Start a novel';
    $('emptyDescription').textContent = 'Create a novel in ' + (state.writer?.name || 'your writer profile') + "'s library.";
    $('emptyAction').textContent = 'Create a novel';
    $('emptyAction').onclick = createNovel;
  } else {
    $('emptyTitle').textContent = 'Create your first character';
    $('emptyDescription').textContent = 'Profiles for ' + state.novel.name + ' will be saved in its own folder.';
    $('emptyAction').textContent = 'New character';
    $('emptyAction').onclick = createCharacter;
  }
  renderCharacterList();
}
async function chooseCharacter(id) {
  if (!(await flush())) { toast('Unsaved changes: retry saving before switching characters.', true); return; }
  const character = state.characters.find(c => c.id === id);
  if (!character) return;
  state.active = character; state.revision = 0; state.savedRevision = 0; state.epoch++;
  renderCharacterList(); renderEditor();
  status('Saved to folder');
}
const sections = [
  { key: 'basic', title: 'Basic Information', fields: [['fullName','Full name'],['age','Age / ages'],['occupation','Occupation'],['appearance','Physical appearance',true]] },
  { key: 'personality', title: 'Personality', fields: [['traits','Personality traits',true],['fears','Fears',true],['beliefs','Beliefs',true],['motivations','Motivations',true]] },
  { key: 'background', title: 'Background', fields: [['history','Personal history',true],['experiences','Significant experiences',true]] },
  { key: 'relationships', title: 'Relationships', fields: [] },
  { key: 'story', title: 'Story Information', fields: [['role','Role in the story'],['timeline','Timeline',true],['events','Important events',true]] },
  { key: 'freeform', title: 'Freeform Notes', fields: [] }
];
let fieldSerial = 0;
function makeField(label, value, update, long = false, undoInfo = null) {
  const container = el('div', 'field' + (long ? ' wide' : ''));
  const lab = el('label', '', label);
  const input = el(long ? 'textarea' : 'input');
  input.id = 'character-field-' + (++fieldSerial);
  lab.htmlFor = input.id;
  if (long) input.rows = 3;
  input.value = value ?? '';
  let group = null;
  input.addEventListener('focus',()=>{group='field-'+(++fieldFocusSerial);});
  input.addEventListener('input', () => {
    if (undoInfo) {
      if (!group) group='field-'+(++fieldFocusSerial);
      const { character, section, key }=undoInfo;
      const before=character[section]?.[key] ?? '';
      rememberFieldUndo(character,section,key,before,group,'Edit '+label);
    }
    update(input.value);
  });
  container.append(lab, input);
  return container;
}
function formatMoment(value) {
  const d = value && new Date(value);
  return d && Number.isFinite(d.getTime()) ? d.toLocaleString() : 'Not recorded';
}
function localDatetimeValue(value) {
  const d = value && new Date(value);
  if (!d || !Number.isFinite(d.getTime())) return '';
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0,16);
}
function renderProfileMetadata(character) {
  const root=el('div','profileMetadata');
  const title=el('h3','', 'Character record'); root.append(title);
  const grid=el('div','recordGrid');
  const created=el('div','recordItem');
  created.append(el('span','recordLabel','Date created'),el('strong','',formatMoment(character.createdAt)));
  const edit=el('button','textButton','Edit creation date');edit.type='button';
  const input=el('input');input.type='datetime-local';input.value=localDatetimeValue(character.createdAt);input.className='hidden';input.setAttribute('aria-label','Set character creation date');
  const save=el('button','quiet hidden','Save date');save.type='button';
  const cancel=el('button','textButton hidden','Cancel');cancel.type='button';
  edit.onclick=()=>{edit.classList.add('hidden');input.classList.remove('hidden');save.classList.remove('hidden');cancel.classList.remove('hidden');input.focus();};
  cancel.onclick=()=>{input.value=localDatetimeValue(character.createdAt);edit.classList.remove('hidden');input.classList.add('hidden');save.classList.add('hidden');cancel.classList.add('hidden');};
  save.onclick=()=>{
    if(!input.value || !Number.isFinite(new Date(input.value).getTime())){toast('Select a valid creation date and time.',true);return;}
    const next=new Date(input.value).toISOString();
    if(next!==character.createdAt){
      const before=character.createdAt;
      rememberUndo('Edit creation date',async()=>{
        const target=state.characters.find(c=>c.id===character.id);if(!target)return false;
        target.createdAt=before; if(target===state.active){queueSave();if(!(await flush()))return false;renderEditor();}
        return true;
      });
      character.createdAt=next;queueSave();
    }
    renderEditor();
  };
  created.append(edit,input,save,cancel);
  const updated=el('div','recordItem');const updatedValue=el('strong','',formatMoment(character.updatedAt));updatedValue.dataset.profileUpdatedFor=character.id;updated.append(el('span','recordLabel','Last updated'),updatedValue,el('span','muted','Automatically recorded after a successful character save'));
  grid.append(created,updated);root.append(grid);return root;
}
function renderEditor() {
  const character = state.active;
  if (!character) return renderEmpty();
  hideMainViews(); cleanGalleryUrls(); $('editor').classList.remove('hidden');
  setWorkspaceView('editor');
  $('profileBookName').textContent = state.novel?.name || 'Novel';
  $('profileNavName').textContent = character.name;
  $('characterName').textContent = character.name;
  setActiveSidebarNavigation('');
  $('lastSavedLabel').textContent = character.updatedAt && Number.isFinite(Date.parse(character.updatedAt)) ? 'Last saved ' + new Date(character.updatedAt).toLocaleString() : 'Last updated: not recorded';
  const host = $('sections'); host.replaceChildren();
  for (const section of sections) {
    character[section.key] ??= {};
    const details = el('details','section'); details.open = true;
    details.id = 'section-' + section.key;
    const summary = el('summary'); summary.append(el('span','',section.title),el('span','', '⌄'));
    const body = el('div','sectionBody');
    if (section.fields.length) {
      const grid = el('div','fields');
      for (const [key, label, long] of section.fields) {
        const fieldRow=makeField(label, character[section.key][key] || '', value => {
          character[section.key][key] = value;
          if (section.key === 'basic' && key === 'fullName') {
            character.name = value || 'Unnamed';
            $('characterName').textContent = character.name;
            $('profileNavName').textContent = character.name;
            renderCharacterList();
          }
          queueSave();
        }, !!long, {character,section:section.key,key});
        fieldRow.dataset.section=section.key;fieldRow.dataset.field=key;grid.append(fieldRow);
      }
      body.append(grid);
    }
    if (section.key === 'relationships') renderRelationships(body, character);
    if (section.key === 'story') renderCharacterTimelineEvents(body, character);
    const notes = el('div','notes');
    const notesField=makeField(section.key === 'freeform' ? 'Notes' : 'Additional notes', character[section.key].notes || '', value => {
      character[section.key].notes = value;
      queueSave();
    }, true, {character,section:section.key,key:'notes'});
    notesField.dataset.section=section.key;notesField.dataset.field='notes';notes.append(notesField);
    body.append(notes);
    if (section.key === 'freeform') body.append(renderProfileMetadata(character));
    details.append(summary, body); host.append(details);
  }
  void renderPortrait(character);
}
function relatedCharacters(character) {
  const own = character.relationships?.links || [];
  const incoming = state.characters.filter(other => other.id !== character.id && (other.relationships?.links || []).some(r => r.id === character.id)).map(other => ({ id: other.id, notes: '', incoming: true }));
  return [...own, ...incoming.filter(r => !own.some(o => o.id === r.id))].filter(r => state.characters.some(x => x.id === r.id));
}
function renderRelationships(host, character) {
  character.relationships.links ??= [];
  for (const link of relatedCharacters(character)) {
    const target = state.characters.find(c => c.id === link.id);
    const row = el('div','relationshipRow');
    const jump = el('button','linkButton', target.name); jump.type = 'button'; jump.onclick = () => void chooseCharacter(target.id); row.append(jump);
    const own = character.relationships.links.find(x => x.id === link.id);
    if (own) {
      const kind = el('select');
      kind.setAttribute('aria-label', 'Relationship type with ' + target.name);
      addTypes(kind, own.type);
      kind.addEventListener('change', () => { const old=new Map([[character.id,structuredClone(character.relationships.links)]]);own.type=kind.value; rememberLinksUndo([character],old,'Change relationship');queueSave(); });
      row.append(kind);
      const notes = el('textarea'); notes.placeholder = 'Notes from this character’s perspective…'; notes.value = own.notes || '';
      let relationGroup=null;notes.addEventListener('focus',()=>{relationGroup='relation-'+(++fieldFocusSerial);});
      notes.addEventListener('input', () => { if(!relationGroup)relationGroup='relation-'+(++fieldFocusSerial);const old=new Map([[character.id,structuredClone(character.relationships.links)]]); rememberLinksUndo([character],old,'Edit relationship notes',relationGroup);own.notes=notes.value; queueSave(); });
      row.append(notes);
      const remove = el('button','removeButton','Unlink'); remove.type = 'button';
      remove.onclick = () => { const old=new Map([[character.id,structuredClone(character.relationships.links)]]);character.relationships.links=character.relationships.links.filter(x=>x.id!==link.id);rememberLinksUndo([character],old,'Unlink character');queueSave();renderEditor(); };
      row.append(remove);
    } else {
      row.append(el('span','muted','Linked from '+target.name));
      const addOwn = el('button','quiet','Add my notes'); addOwn.type = 'button';
      addOwn.onclick = () => { const old=new Map([[character.id,structuredClone(character.relationships.links)]]);character.relationships.links.push({ id: target.id, notes: '' });rememberLinksUndo([character],old,'Add relationship notes');queueSave(); renderEditor(); };
      row.append(addOwn);
    }
    host.append(row);
  }
  const picker = el('div','relationPicker'), select = el('select');
  select.append(new Option('Select character to link…',''));
  const linked = new Set(relatedCharacters(character).map(r => r.id));
  for (const c of state.characters.filter(c => c.id !== character.id && !linked.has(c.id))) select.add(new Option(c.name, c.id));
  const add = el('button','primary','Link character'); add.type = 'button'; add.disabled = select.options.length < 2;
  add.onclick = () => { if (!select.value) return; const old=new Map([[character.id,structuredClone(character.relationships.links)]]); character.relationships.links.push({ id: select.value, notes: '' });rememberLinksUndo([character],old,'Link character');queueSave(); renderEditor(); };
  picker.append(select,add); host.append(picker);
  host.append(el('p','muted','Links appear on both profiles; each writer can add notes from either character’s perspective.'));
}
function cleanPortraitUrl() { if (state.portraitUrl) URL.revokeObjectURL(state.portraitUrl); state.portraitUrl = null; }
async function renderPortrait(character) {
  const frame = $('portrait');
  cleanPortraitUrl(); frame.replaceChildren(el('span','silhouette','♟'));
  if (!character.portraitFile || !state.portraitsDir) return;
  const epoch = state.epoch;
  try {
    const file = await (await state.portraitsDir.getFileHandle(character.portraitFile)).getFile();
    if (state.active !== character || epoch !== state.epoch) return;
    const url = URL.createObjectURL(file); state.portraitUrl = url;
    const img = el('img'); img.src = url; img.alt = 'Portrait of ' + character.name;
    frame.replaceChildren(img);
  } catch { /* show default silhouette if photo was removed */ }
}
async function uploadPortrait(event) {
  const file = event.target.files?.[0], character = state.active;
  event.target.value = '';
  if (!file || !character) return;
  if (!['image/png','image/jpeg','image/webp'].includes(file.type)) { toast('Choose a PNG, JPEG, or WebP image.', true); return; }
  if (file.size > 5 * 1024 * 1024) { toast('Portraits must be 5 MB or smaller.', true); return; }
  if (!(await flush())) return;
  try {
    status('Saving portrait…', 'busy');
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = character.id + '.' + ext;
    await putFile(state.portraitsDir, filename, file);
    character.portraitFile = filename;
    queueSave();
    if (await flush()) { await renderPortrait(character); toast('Portrait saved to USB.'); }
  } catch (error) { status('Portrait save failed', 'bad'); toast('Could not save portrait: ' + error.message, true); }
}
async function removePortrait() {
  if (!state.active?.portraitFile) return;
  if (!confirm('Remove the portrait from this profile?')) return;
  state.active.portraitFile = null;
  queueSave();
  if (await flush()) await renderPortrait(state.active);
}
// Never delete a file merely because a small icon was clicked. Both actions
// require a second, explicitly named confirmation. Escape and Cancel do nothing.
let deleteInProgress = false;
function confirmDeletion(kind, name, details) {
  const dialog = $('deleteDialog');
  $('deleteDialogTitle').textContent = 'Are you sure?';
  $('deleteDialogDescription').textContent = 'Delete ' + kind + ' “' + name + '”? ' + details;
  $('confirmDeleteBtn').textContent = kind === 'book' ? 'Yes, delete book' : 'Yes, delete character';
  return new Promise(resolve => {
    const cancel = $('cancelDeleteBtn');
    const proceed = $('confirmDeleteBtn');
    let accepted = false;
    const onCancel = () => dialog.close('cancel');
    const onProceed = () => { accepted = true; dialog.close('confirm'); };
    const onClose = () => {
      cancel.removeEventListener('click', onCancel);
      proceed.removeEventListener('click', onProceed);
      dialog.removeEventListener('close', onClose);
      resolve(accepted && dialog.returnValue === 'confirm');
    };
    cancel.addEventListener('click', onCancel);
    proceed.addEventListener('click', onProceed);
    dialog.addEventListener('close', onClose);
    dialog.showModal();
    // Focus the safe option. Enter cannot accidentally confirm deletion.
    cancel.focus();
  });
}
async function deleteCharacter(id) {
  if (deleteInProgress || !state.novel || !state.charsDir) return;
  const character = state.characters.find(c => c.id === (typeof id === 'string' ? id : state.active?.id));
  if (!character) return;
  const novelId = state.novel.id, writerId = state.writer?.id;
  const approved = await confirmDeletion('character', character.name,
    'Its character profile will be permanently removed from this novel, along with its portrait (if present).');
  if (!approved || deleteInProgress) return;
  // Protect pending changes to this or any other profile.
  if (!(await flush())) { toast('Deletion cancelled because changes could not be saved.', true); return; }
  if (state.novel?.id !== novelId || state.writer?.id !== writerId || !state.characters.includes(character)) return;
  deleteInProgress = true;
  try {
    status('Deleting character…', 'busy');
    await removeTrackedEntry(state.charsDir,character._filename);
    // Only after the character file is removed should the UI forget this character.
    state.characters = state.characters.filter(c => c.id !== character.id);
    clearUndo(); // Permanent file deletion is intentionally not undoable.
    if (state.treeMeta?.positions?.[character.id]) { delete state.treeMeta.positions[character.id]; queueTreeSave(); }
    if (state.active?.id === character.id) {
      state.active = null;
      state.revision = state.savedRevision = 0;
      state.epoch++;
      cleanPortraitUrl();
    }
    // A deleted character's private revision snapshots are also removed.
    try {const revisions=await state.novelDir.getDirectoryHandle('revisions');await removeTrackedEntry(revisions,character.id,{recursive:true});}
    catch(e){if(e.name!=='NotFoundError')console.warn('Could not clean character revisions:',e);}
    let portraitFailure = null;
    if (character.portraitFile && character.portraitFile.startsWith(character.id + '.')) {
      try { await removeTrackedEntry(state.portraitsDir,character.portraitFile); }
      catch (error) { if (error.name !== 'NotFoundError') portraitFailure = error; }
    }
    if(state.timelineEvents.some(e=>e.characterIds.includes(character.id))) {
      try{
        const next=state.timelineEvents.map(e=>({...e,characterIds:e.characterIds.filter(id=>id!==character.id)}));
        await putJSON(state.novelDir,'timeline.json',{type:'character-bookshelf-timeline',version:1,events:next});
        state.timelineEvents=next;
      } catch(e){toast('Character deleted, but timeline links need checking: '+e.message,true);}
    }
    renderCharacterList();
    await showCharacters();
    status(portraitFailure ? 'Character deleted; portrait cleanup incomplete' : 'Saved to folder');
    toast(portraitFailure
      ? 'Character deleted, but its portrait file could not be removed: ' + portraitFailure.message
      : 'Character deleted from USB.', !!portraitFailure);
  } catch (error) {
    status('Delete failed', 'bad');
    toast('Character was not deleted: ' + error.message, true);
  } finally { deleteInProgress = false; }
}
async function deleteBook(id) {
  if (deleteInProgress || !state.writerDir || !state.writer) return;
  const novel = state.novels.find(n => n.id === id);
  if (!novel) return;
  const writerId = state.writer.id;
  const approved = await confirmDeletion('book', novel.name,
    'Its entire novel folder will be deleted, including ALL character profiles, notes, relationships, portraits, and any other files inside that folder.');
  if (!approved || deleteInProgress) return;
  if (!(await flush())) { toast('Deletion cancelled because changes could not be saved.', true); return; }
  if (state.writer?.id !== writerId || !state.novels.includes(novel)) return;
  deleteInProgress = true;
  try {
    status('Deleting book…', 'busy');
    // File System Access API: remove the named book folder and all its contents.
    // Only the selected writer's known novel folder is eligible for deletion.
    await removeTrackedEntry(state.writerDir,novel.folder,{recursive:true});
    state.novels = state.novels.filter(n => n.id !== novel.id);
    if (state.novel?.id === novel.id) clearNovelState();
    renderNovelSelect();
    await showBookshelf();
    status('Saved to folder');
    clearUndo(); // Permanent deletion cannot be reversed through Undo.
    toast('Book and its character files deleted from USB.');
  } catch (error) {
    status('Delete failed', 'bad');
    toast('Could not delete book. Check the USB folder before trying again: ' + error.message, true);
    // Recursive deletion may partially remove files on an interrupted USB write.
    // We do not claim success; the user should inspect the folder first.
  } finally { deleteInProgress = false; }
}
function downloadUnsavedProfile() {
  const character = state.active;
  if (!character) return;
  const snapshot = { ...diskProfile(character), updatedAt: dateNow() };
  const blob = new Blob([JSON.stringify(snapshot, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = character._filename || folderSafe(character.name) + '.json';
  document.body.append(anchor);
  anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
  toast('Downloaded a recovery copy. The USB file has not been updated.');
}
/* v3.8: self-contained STORE-method ZIP for one selected writer. No network. */
const WRITER_BACKUP_LIMIT = 512 * 1024 * 1024;
const WRITER_BACKUP_FILE_LIMIT = 30000;
let pendingWriterRestore = null;
async function visitBackupFiles(dir,prefix,files,budget){
  for await(const [name,entry] of dir.entries()){
    if(name==='.'||name==='..'||name.includes('/')||name.includes('\\'))throw Error('Unsafe file name in library.');
    const path=prefix+name;
    if(entry.kind==='directory')await visitBackupFiles(entry,path+'/',files,budget);
    else if(entry.kind==='file'){
      const file=await entry.getFile();
      budget.size+=file.size;budget.count++;
      if(budget.size>WRITER_BACKUP_LIMIT||budget.count>WRITER_BACKUP_FILE_LIMIT)throw Error('Backup exceeds browser-safe size or file count. Use Copy full library to another folder instead.');
      files.push([path,new Uint8Array(await file.arrayBuffer())]);
    }
  }
}
async function exportWriterZip(){
  const button=$('exportWriterZipBtn');button.disabled=true;
  try{
    if(!state.writer)throw Error('Select a writer before exporting a writer ZIP.');
    if(!(await flush()))throw Error('Unsaved changes prevented the backup.');
    $('backupDialogStatus').textContent='Reading all files for '+state.writer.name+'…';
    const files=[],budget={count:0,size:0};
    await visitBackupFiles(state.writerDir,'writer/',files,budget);
    const marker={type:'character-bookshelf-writer-backup',version:1,writer:{name:state.writer.name,id:state.writer.id},exportedAt:dateNow(),files:budget.count};
    files.unshift(['backup.json',JSON.stringify(marker,null,2)]);
    const zip=zipBytes(files);
    const blob=new Blob([zip],{type:'application/zip'});
    downloadBlob(blob,'Character-Bookshelf-'+folderSafe(state.writer.name)+'-'+new Date().toISOString().slice(0,10)+'.zip');
    $('backupDialogStatus').textContent='Writer ZIP downloaded: '+budget.count+' files. Keep a copy outside the USB drive.';
    recordBackupExport();renderReminderSettings();
    toast('Writer backup download started. Keep a copy outside the USB drive.');
  }catch(e){$('backupDialogStatus').textContent='Not exported: '+e.message;toast('Backup failed: '+e.message,true);}
  finally{button.disabled=false;}
}
function unpackWriterZip(buffer){
  const bytes=new Uint8Array(buffer),view=new DataView(buffer),decoder=new TextDecoder('utf-8',{fatal:true});
  const files=new Map(),paths=new Set();let offset=0,total=0,count=0;
  if(bytes.length>WRITER_BACKUP_LIMIT+5*1024*1024)throw Error('ZIP exceeds the 512 MB restore limit.');
  while(offset+4<=bytes.length){
    const sig=view.getUint32(offset,true);
    if(sig===0x02014b50||sig===0x06054b50)break;
    if(sig!==0x04034b50)throw Error('Unexpected ZIP entry. Only app-exported writer ZIPs are supported.');
    if(offset+30>bytes.length)throw Error('Truncated ZIP header.');
    const flags=view.getUint16(offset+6,true),method=view.getUint16(offset+8,true);
    if((flags&0x8)!==0||method!==0)throw Error('This ZIP uses unsupported compression. Restore a ZIP exported by Character Bookshelf.');
    const expectedCrc=view.getUint32(offset+14,true),compressed=view.getUint32(offset+18,true),uncompressed=view.getUint32(offset+22,true);
    const nameLen=view.getUint16(offset+26,true),extraLen=view.getUint16(offset+28,true);
    if(compressed!==uncompressed)throw Error('Unexpected ZIP entry size.');
    const start=offset+30+nameLen+extraLen,end=start+compressed;
    if(start>bytes.length||end>bytes.length)throw Error('ZIP file appears truncated.');
    const name=decoder.decode(bytes.slice(offset+30,offset+30+nameLen));
    const segments=name.split('/');
    if(name.startsWith('/')||name.includes('\\')||segments.some(seg=>!seg||seg==='.'||seg==='..'||seg.includes(':')||/[\x00-\x1f]/.test(seg)))throw Error('Unsafe file path inside ZIP.');
    const folded=name.toLocaleLowerCase();if(paths.has(folded))throw Error('Duplicate ZIP entry path.');paths.add(folded);
    const data=bytes.slice(start,end);
    if(crc32(data)!==expectedCrc)throw Error('ZIP checksum mismatch for '+name);
    total+=data.byteLength;count++;if(total>WRITER_BACKUP_LIMIT||count>WRITER_BACKUP_FILE_LIMIT)throw Error('ZIP exceeds restore limits.');
    files.set(name,data);offset=end;
  }
  if(!files.has('backup.json'))throw Error('Not a Character Bookshelf writer backup (backup.json missing).');
  let meta;try{meta=JSON.parse(decoder.decode(files.get('backup.json')));}catch{throw Error('Invalid backup metadata.');}
  if(meta?.type!=='character-bookshelf-writer-backup'||meta.version!==1||!cleanName(meta.writer?.name))throw Error('Not a supported Character Bookshelf writer backup.');
  if(meta.files!==files.size-1)throw Error('Backup manifest file count does not match ZIP contents.');
  const content=[...files].filter(([name])=>name.startsWith('writer/'));
  if(content.length!==files.size-1)throw Error('Unrecognized files at ZIP root.');
  // Refuse malformed book metadata BEFORE offering to restore.
  for(const [name,data] of content){
    if(name.endsWith('/novel.json')){
      let novel;try{novel=JSON.parse(decoder.decode(data));}catch{throw Error('Invalid novel.json: '+name);}
      if(novel.type!=='character-archive-novel'||!novel.id||!novel.name)throw Error('Invalid book data in '+name);
    }
    if(name.includes('/characters/')&&name.endsWith('.json')){
      let character;try{character=JSON.parse(decoder.decode(data));}catch{throw Error('Invalid character JSON: '+name);}
      if(!character.id||typeof character.name!=='string')throw Error('Invalid character in '+name);
    }
  }
  return {meta,content,books:content.filter(([n])=>n.endsWith('/novel.json')).length,characters:content.filter(([n])=>n.includes('/characters/')&&n.endsWith('.json')).length,bytes:total};
}
async function beginRestorePreview(event){
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  try{
    if(!state.root)throw Error('Select your Character Bookshelf USB library first.');
    if(!(await flush()))throw Error('Save current changes before restoring.');
    if(file.size>WRITER_BACKUP_LIMIT+5*1024*1024)throw Error('This ZIP is over the restore limit.');
    const loaded=unpackWriterZip(await file.arrayBuffer());pendingWriterRestore=loaded;
    $('restorePreviewDetails').textContent='Backup writer: '+loaded.meta.writer.name+' · '+loaded.books+' books · '+loaded.characters+' characters · '+loaded.content.length+' total files · Exported '+formatMoment(loaded.meta.exportedAt)+'.';
    $('restoreWriterName').value=loaded.meta.writer.name+' (Restored)';
    $('restorePreviewStatus').textContent='No changes have been made.';
    $('restorePreviewDialog').showModal();
  }catch(e){pendingWriterRestore=null;toast('Cannot read backup: '+e.message,true);}
}
async function confirmWriterRestore(){
  if(!pendingWriterRestore||!state.root)return;
  const btn=$('confirmRestoreBtn');btn.disabled=true;
  let folder=null,manifestWritten=false;
  try{
    if(!(await flush()))throw Error('Save current changes first.');
    const backup=pendingWriterRestore;
    const name=cleanName($('restoreWriterName').value);
    if(!name||name.length>100)throw Error('Enter a writer name (100 characters maximum).');
    const manifest=await readJSON(await state.root.getFileHandle('character-archive-manifest.json'));validateManifest(manifest);
    if(manifest.writers.some(w=>w.name.toLocaleLowerCase()===name.toLocaleLowerCase()))throw Error('A writer with that name already exists. Choose another name.');
    const writer={id:randomId(),name,folder:''};
    let attempt=folderSafe(name),n=2;
    while(true){
      const alreadyNamed=manifest.writers.some(w=>w.folder.toLocaleLowerCase()===attempt.toLocaleLowerCase());
      let exists=false;
      try{await state.root.getDirectoryHandle(attempt);exists=true;}catch(e){if(e.name!=='NotFoundError')throw e;}
      if(!alreadyNamed&&!exists)break;
      attempt=folderSafe(name)+'-'+n++;
    }
    folder=attempt;writer.folder=folder;
    $('restorePreviewStatus').textContent='Restoring files to a NEW writer folder…';
    const rootDir=await state.root.getDirectoryHandle(folder,{create:true});
    for(const [path,data] of backup.content){
      const segments=path.slice('writer/'.length).split('/');const fileName=segments.pop();
      let current=rootDir;
      for(const segment of segments)current=await current.getDirectoryHandle(segment,{create:true});
      await putFile(current,fileName,data);
    }
    // Make writer visible only after every file is successfully written.
    const next={...manifest,writers:[...manifest.writers,writer]};
    await putJSON(state.root,'character-archive-manifest.json',next);manifestWritten=true;
    state.manifest=next;renderWriterCards();
    pendingWriterRestore=null;$('restorePreviewDialog').close();
    await chooseWriter(writer.id);
    toast('Writer restored as a separate library. Your existing files were untouched.');
  }catch(e){
    if(folder&&!manifestWritten){try{await removeTrackedEntry(state.root,folder,{recursive:true});}catch{toast('Check for incomplete folder '+folder+'; cleanup did not finish.',true);}}
    $('restorePreviewStatus').textContent='NOT restored: '+e.message;
    toast('Restore failed: '+e.message,true);
  }finally{btn.disabled=false;}
}
async function backupLibrary() {
  if (hasUnsaved() || state.saving) {
    toast('Finish saving before backing up. Then click Back up library again.', true);
    void flush();
    return;
  }
  if (typeof window.showDirectoryPicker !== 'function') return;
  let target;
  try { target = await window.showDirectoryPicker({ mode: 'readwrite' }); }
  catch (error) { if (error.name !== 'AbortError') toast('Backup cancelled: ' + error.message, true); return; }
  try {
    if (typeof state.root.isSameEntry === 'function' && await state.root.isSameEntry(target)) throw new Error('Choose a different folder for the backup.');
    if (typeof state.root.resolve !== 'function') throw new Error('Cannot verify that the backup destination is separate. Choose a supported Chrome or Edge version.');
    if (await state.root.resolve(target) !== null) throw new Error('The backup location must not be inside your active library.');
    if (typeof target.queryPermission === 'function' && await target.queryPermission({ mode: 'readwrite' }) !== 'granted') {
      if (await target.requestPermission({mode:'readwrite'}) !== 'granted') throw new Error('Write permission was not granted.');
    }
    const stamp = dateNow().replace(/[:.]/g,'-');
    const folder = await target.getDirectoryHandle('Character-Bookshelf-Backup-' + stamp, {create:true});
    status('Backing up…', 'busy');
    await copyFolder(state.root, folder);
    status('Backup complete');
    toast('Backup copied successfully.');
  } catch (error) { status('Backup failed', 'bad'); toast('Backup could not finish: ' + error.message, true); }
}
async function copyFolder(source, dest) {
  for await (const [name, handle] of source.entries()) {
    if (handle.kind === 'directory') {
      const child = await dest.getDirectoryHandle(name, { create: true });
      await copyFolder(handle, child);
    } else if (handle.kind === 'file') {
      const file = await handle.getFile();
      const output = await dest.getFileHandle(name, { create: true });
      await writeHandle(output, file);
    }
  }
}
/* v3.3 Character Tree: derives connections from saved character relationships.
   Only manual node positions live in character-tree.json; character metadata remains
   in the existing per-character JSON. Unknown relationships are NOT guessed. */
const TREE_TYPES = [
  ['connected','Connected (unspecified)'],
  ['parent','Parent of →'],['child','Child of →'],
  ['sibling','Sibling of'],['partner','Spouse / partner of'],
  ['ex-spouse','Ex-spouse of'],['ex-partner','Ex-partner of'],
  ['fiance','Fiancé(e) of'],['dating','Dating / romantic partner'],
  ['grandparent','Grandparent of →'],['grandchild','Grandchild of →'],
  ['aunt-uncle','Aunt / uncle of →'],['niece-nephew','Niece / nephew of →'],
  ['cousin','Cousin of'],['step-parent','Step-parent of →'],['step-child','Step-child of →'],
  ['adoptive-parent','Adoptive parent of →'],['adopted-child','Adopted child of →'],
  ['friend','Friend of'],['best-friend','Best friend of'],['estranged','Estranged from'],
  ['rival','Rival / enemy of'],['ally','Ally of'],['mentor','Mentor of →'],
  ['student','Student of →'],['coworker','Coworker of'],['other','Other relationship']
];
const treeTypeName = type => TREE_TYPES.find(([id]) => id === type)?.[1] || TREE_TYPES[0][1];
const treeType = value => TREE_TYPES.some(([id]) => id === value) ? value : 'connected';
const treeMetaBlank = () => ({type:'character-bookshelf-tree',version:1,positions:{}});
async function loadTreeMeta(directory) {
  try {
    const data = await readJSON(await directory.getFileHandle('character-tree.json'));
    if (data?.type !== 'character-bookshelf-tree' || !data.positions || Array.isArray(data.positions))
      throw new Error('Invalid character-tree.json — leaving existing files untouched.');
    return data;
  } catch (error) {
    if (error.name === 'NotFoundError') return treeMetaBlank();
    throw error;
  }
}
function treeUnsaved() { return state.treeRevision > state.treeSavedRevision; }
function queueTreeSave() {
  if (!state.novelDir || !state.treeMeta) return;
  state.treeRevision++;
  $('treeSaveLabel').textContent = 'Unsaved layout changes';
  $('treeSaveLabel').dataset.kind = 'busy';
  clearTimeout(state.treeTimer);
  state.treeTimer = setTimeout(() => { void flushTree(); }, 450);
}
async function flushTree() {
  clearTimeout(state.treeTimer); state.treeTimer = null;
  if (state.treeSaving) return state.treeSaving;
  if (!treeUnsaved() || !state.novelDir) return true;
  const dir = state.novelDir, meta = state.treeMeta;
  state.treeSaving = (async () => {
    while (treeUnsaved()) {
      const revision = state.treeRevision;
      try {
        $('treeSaveLabel').textContent = 'Saving layout…';
        $('treeSaveLabel').dataset.kind = 'busy';
        await putJSON(dir,'character-tree.json',{...meta,updatedAt:dateNow()});
        state.treeSavedRevision = revision;
      } catch (error) {
        const base=await recoveryPath(dir);
        if(base!==null)memoryRecovery.pending.set([base,'character-tree.json'].filter(Boolean).join('/'),{bytes:encoder.encode(JSON.stringify(meta,null,2)+'\n'),reason:error.message});
        storageFailed(error);
        $('treeSaveLabel').textContent = 'Layout save failed — retry before leaving';
        $('treeSaveLabel').dataset.kind = 'bad';
        status('Tree save failed', 'bad');
        toast('Could not save tree positions: ' + error.message + '. Keep this page open and retry.', true);
        return false;
      }
    }
    $('treeSaveLabel').textContent = 'Layout saved to USB';
    $('treeSaveLabel').dataset.kind = '';
    status('Saved to folder');
    return true;
  })();
  try { return await state.treeSaving; }
  finally { state.treeSaving = null; }
}
// Each pair of characters is one connection, even when both profiles link each other.
function treeConnections() {
  const pairs = new Map(), valid = new Set(state.characters.map(c => c.id));
  for (const source of state.characters) for (const link of source.relationships?.links || []) {
    if (!link?.id || link.id === source.id || !valid.has(link.id)) continue;
    const key = [source.id,link.id].sort().join('|');
    const candidate = {key,from:source.id,to:link.id,type:treeType(link.type)};
    const previous = pairs.get(key);
    if (!previous || (previous.type === 'connected' && candidate.type !== 'connected')) pairs.set(key,candidate);
  }
  return [...pairs.values()];
}
function treeLayout(connections) {
  const chars=state.characters;
  const groupParent=new Map(chars.map(c=>[c.id,c.id]));
  const find=id=>{let p=groupParent.get(id);while(p && p!==groupParent.get(p)){p=groupParent.get(p);}return p || id;};
  const unite=(a,b)=>{const x=find(a),y=find(b);if(x!==y)groupParent.set(y,x);};
  for(const e of connections)if(['partner','sibling','ex-spouse','ex-partner','fiance','dating','cousin'].includes(e.type))unite(e.from,e.to);
  const groups=new Map(); for(const c of chars){const g=find(c.id);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(c);}
  const levels=new Map([...groups.keys()].map(x=>[x,0]));
  const hier=[];
  for(const e of connections){
    let from=e.from,to=e.to;
    if(['child','grandchild','step-child','adopted-child','niece-nephew'].includes(e.type)) [from,to]=[to,from];
    if(!['parent','child','grandparent','grandchild','step-parent','step-child','adoptive-parent','adopted-child','aunt-uncle','niece-nephew'].includes(e.type))continue;
    from=find(from);to=find(to);if(from!==to)hier.push({from,to});
  }
  // Relax parent-child ranks, with a guard against inconsistent cycles.
  for(let pass=0;pass<groups.size;pass++){
    let changed=false;
    for(const e of hier){const next=(levels.get(e.from)||0)+1;
      if(next>(levels.get(e.to)||0) && next<groups.size+1){levels.set(e.to,next);changed=true;}}
    if(!changed)break;
  }
  const ordered=[...groups.entries()].sort((a,b)=>{
    const delta=(levels.get(a[0])||0)-(levels.get(b[0])||0);
    return delta || a[1][0].name.localeCompare(b[1][0].name);
  });
  const rankMembers=new Map();
  for(const [gid,members] of ordered){const rank=levels.get(gid)||0;
    if(!rankMembers.has(rank))rankMembers.set(rank,[]);
    rankMembers.get(rank).push(...members.sort((a,b)=>a.name.localeCompare(b.name)));
  }
  const positions={};let y=65;
  for(const [rank,members] of [...rankMembers.entries()].sort((a,b)=>a[0]-b[0])){
    let maxRow=0;
    members.forEach((c,i)=>{const row=Math.floor(i/5),col=i%5;
      positions[c.id]={x:70+col*220,y:y+row*153};maxRow=Math.max(maxRow,row);});
    y+=(maxRow+1)*153+75;
  }
  return positions;
}
function treePositions(connections) {
  const auto=treeLayout(connections), out={};
  for(const c of state.characters){
    const pos=state.treeMeta?.positions?.[c.id];
    out[c.id]=pos && Number.isFinite(pos.x) && Number.isFinite(pos.y) ?
      {x:Math.max(10,pos.x),y:Math.max(12,pos.y)} : auto[c.id];
  }
  return out;
}
const svgEl = name => document.createElementNS('http://www.w3.org/2000/svg',name);
function drawTreeLines(connections, positions, width, height) {
  const svg=$('treeLines');svg.replaceChildren();
  svg.setAttribute('width',width);svg.setAttribute('height',height);
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  for(const c of connections){
    const a=positions[c.from],b=positions[c.to];if(!a||!b)continue;
    const hierarchy=['parent','child','grandparent','grandchild','step-parent','step-child','adoptive-parent','adopted-child','aunt-uncle','niece-nephew'].includes(c.type);
    // Start/end at the actual card borders, rather than disappearing beneath them.
    const parentReverse=['child','grandchild','step-child','adopted-child','niece-nephew'].includes(c.type);
    const upper=parentReverse?b:a,lower=parentReverse?a:b;
    let startX,startY,endX,endY,pathData;
    if(hierarchy && lower.y>upper.y+90){
      startX=upper.x+90;startY=upper.y+95;endX=lower.x+90;endY=lower.y;
      const mid=(startY+endY)/2;
      pathData=`M ${startX} ${startY} V ${mid} H ${endX} V ${endY}`;
    }else{
      const aCenter={x:a.x+90,y:a.y+48},bCenter={x:b.x+90,y:b.y+48};
      if(Math.abs(aCenter.x-bCenter.x)>Math.abs(aCenter.y-bCenter.y)){
        startX=aCenter.x+(aCenter.x<bCenter.x?90:-90);startY=aCenter.y;
        endX=bCenter.x+(aCenter.x<bCenter.x?-90:90);endY=bCenter.y;
      }else{
        startX=aCenter.x;startY=aCenter.y+(aCenter.y<bCenter.y?47:-47);
        endX=bCenter.x;endY=bCenter.y+(aCenter.y<bCenter.y?-47:47);
      }
      const mx=(startX+endX)/2;
      pathData=`M ${startX} ${startY} C ${mx} ${startY}, ${mx} ${endY}, ${endX} ${endY}`;
    }
    const glow=svgEl('path');glow.setAttribute('d',pathData);glow.setAttribute('class','treeEdgeGlow');svg.append(glow);
    const path=svgEl('path');path.setAttribute('d',pathData);
    path.setAttribute('class','treeEdge'+(c.type==='connected'?' treeEdgeOther':''));svg.append(path);
    const label=treeTypeName(c.type).replace(/ →$/,'').replace(/ of$/,'');
    const lx=(startX+endX)/2,ly=(startY+endY)/2-10;
    const labelWidth=Math.max(52,Math.min(220,label.length*6.6+18));
    const back=svgEl('rect');back.setAttribute('x',lx-labelWidth/2);back.setAttribute('y',ly-15);
    back.setAttribute('width',labelWidth);back.setAttribute('height',21);back.setAttribute('rx',6);
    back.setAttribute('class','treeEdgeLabelBacking');svg.append(back);
    const text=svgEl('text');text.setAttribute('class','treeEdgeLabel');text.setAttribute('x',lx);text.setAttribute('y',ly);
    text.setAttribute('text-anchor','middle');text.textContent=label;svg.append(text);
  }
}
function addTypes(select,selected='connected') {
  for(const [value,label] of TREE_TYPES) select.add(new Option(label,value));
  select.value=treeType(selected);
}
async function persistTreeLink(source,oldLinks) {
  try {
    const updated={...source,updatedAt:dateNow()};
    await writeHandle(source._handle,JSON.stringify(diskProfile(updated),null,2)+'\n');
    source.updatedAt=updated.updatedAt;
    status('Saved to folder');
    return true;
  } catch(error){
    source.relationships.links=oldLinks;
    status('Relationship save failed','bad');
    toast('Could not save relationship to USB: '+error.message,true);
    return false;
  }
}
async function setTreeConnectionType(edge,type) {
  if(!(await flush()))return false;
  const source=state.characters.find(c=>c.id===edge.from);
  const target=state.characters.find(c=>c.id===edge.to);
  if(!source||!target)return false;
  source.relationships ??={links:[],notes:''};source.relationships.links??=[];
  const old=structuredClone(source.relationships.links);
  const link=source.relationships.links.find(x=>x.id===target.id);
  if(link)link.type=type;
  else source.relationships.links.push({id:target.id,notes:'',type});
  if(await persistTreeLink(source,old)) {
    rememberLinksUndo([source],new Map([[source.id,old]]),'Change relationship');
    renderTree();return true;
  }
  return false;
}
async function addTreeConnections(from, targetIds, type) {
  if(!from || !targetIds.length){toast('Select a source and one or more other characters.',true);return false;}
  if(!(await flush()))return false;
  const source=state.characters.find(c=>c.id===from);
  if(!source)return false;
  source.relationships??={links:[],notes:''};source.relationships.links??=[];
  const old=structuredClone(source.relationships.links);
  let added=0;
  for(const to of [...new Set(targetIds)]) {
    if(to===from||!state.characters.some(c=>c.id===to))continue;
    const key=[from,to].sort().join('|');
    if(treeConnections().some(e=>e.key===key))continue;
    source.relationships.links.push({id:to,notes:'',type});added++;
  }
  if(!added){toast('Those characters are already linked. You can change their relationship below.',true);return false;}
  if(await persistTreeLink(source,old)) {
    rememberLinksUndo([source],new Map([[source.id,old]]),`Link ${added} character${added===1?'':'s'}`);
    renderTree();toast(`Linked ${added} character${added===1?'':'s'}; lines saved to USB.`);
    return true;
  }
  return false;
}
async function addTreeConnection() {
  const from=$('treeFrom').value;
  const targets=[...document.querySelectorAll('#treeTargets input:checked')].map(input=>input.value);
  const ok=await addTreeConnections(from,targets,$('treeNewType').value);
  if(ok) for(const input of document.querySelectorAll('#treeTargets input:checked'))input.checked=false;
}
function askTreeDrop(source,target,existing) {
  const dialog=$('treeDropDialog');
  $('treeDropTitle').textContent=existing?'Change this relationship?':'Link these characters?';
  $('treeDropDescription').textContent=existing?
    `“${source.name}” and “${target.name}” are already linked. Choose a new relationship if you'd like to change it.`:
    `Create a line connecting “${source.name}” to “${target.name}”?`;
  const select=$('treeDropType');select.replaceChildren();addTypes(select,existing?.type||'connected');
  $('treeDropConfirm').textContent=existing?'Change relationship':'Link characters';
  return new Promise(resolve=>{
    const cancel=$('treeDropCancel'),go=$('treeDropConfirm');let confirmed=false;
    const onCancel=()=>dialog.close('cancel');
    const onConfirm=()=>{confirmed=true;dialog.close('confirm')};
    const onClose=()=>{
      cancel.removeEventListener('click',onCancel);go.removeEventListener('click',onConfirm);dialog.removeEventListener('close',onClose);
      resolve(confirmed?select.value:null);
    };
    cancel.addEventListener('click',onCancel);go.addEventListener('click',onConfirm);
    dialog.addEventListener('close',onClose);dialog.showModal();cancel.focus();
  });
}
async function removeTreeConnection(edge){
  const a=state.characters.find(c=>c.id===edge.from),b=state.characters.find(c=>c.id===edge.to);
  if(!a||!b)return;
  if(!confirm(`Remove the connection between ${a.name} and ${b.name}? Their profiles will remain.`))return;
  if(!(await flush()))return;
  const changed=[a,b].filter(c=>(c.relationships?.links||[]).some(x=>x.id===(c===a?b.id:a.id)));
  const before=new Map(changed.map(c=>[c.id,structuredClone(c.relationships.links)]));
  let success=true;
  for(const c of changed){
    const old=structuredClone(c.relationships.links), other=c===a?b:a;
    c.relationships.links=c.relationships.links.filter(x=>x.id!==other.id);
    if(!(await persistTreeLink(c,old))){
      toast('The connection was only partially changed. Reopen the novel to inspect both profiles.',true);
      success=false;break;
    }
  }
  if(success && changed.length)rememberLinksUndo(changed,before,'Remove relationship');
  renderTree();
}
function renderTree() {
  if(!state.novel)return;
  const edges=treeConnections(),positions=treePositions(edges),container=$('treeNodes');
  container.replaceChildren();
  const width=Math.max(940,...Object.values(positions).map(p=>Math.ceil(p.x+230)));
  const height=Math.max(340,...Object.values(positions).map(p=>Math.ceil(p.y+175)));
  $('treeStage').style.width=width+'px';$('treeStage').style.height=height+'px';
  drawTreeLines(edges,positions,width,height);
  for(const character of state.characters){
    const p=positions[character.id];
    const card=el('div','treeNode');card.dataset.nodeId=character.id;card.style.left=p.x+'px';card.style.top=p.y+'px';
    const head=el('div','treeNodeHead');
    const role=el('span','treeNodeRole',character.story?.role||'Character');
    const drag=el('button','treeNodeHandle','⠿');drag.type='button';
    drag.title='Drag to reposition '+character.name;
    drag.setAttribute('aria-label','Drag to reposition '+character.name);
    head.append(role,drag);
    const open=el('button','treeNodeOpen',character.name);open.type='button';
    open.addEventListener('click',()=>void chooseCharacter(character.id));
    card.append(head,open,el('span','treeNodeCaption','Open profile ↗'));
    container.append(card);
    drag.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      event.preventDefault();drag.setPointerCapture(event.pointerId);
      const startX=event.clientX,startY=event.clientY,original={...positions[character.id]};
      const previousManual=state.treeMeta?.positions?.[character.id];
      const undoPosition=previousManual?{...previousManual}:null;
      let moved=false;
      const highlightTarget=()=>{
        const p=positions[character.id];
        let candidate=null,best=0;
        for(const c of state.characters){
          if(c.id===character.id)continue;
          const q=positions[c.id];if(!q)continue;
          const overlapX=Math.max(0,Math.min(p.x+180,q.x+180)-Math.max(p.x,q.x));
          const overlapY=Math.max(0,Math.min(p.y+94,q.y+94)-Math.max(p.y,q.y));
          const intersection=overlapX*overlapY;
          if(intersection>1500 && intersection>best){best=intersection;candidate=c;}
        }
        container.querySelectorAll('.treeNode').forEach(n=>n.classList.remove('linkTarget'));
        if(candidate)container.querySelector(`[data-node-id="${candidate.id}"]`)?.classList.add('linkTarget');
        return candidate;
      };
      const move=e=>{
        if(e.pointerId!==event.pointerId)return;
        moved ||= Math.hypot(e.clientX-startX,e.clientY-startY)>5;
        positions[character.id]={x:Math.max(10,original.x+e.clientX-startX),y:Math.max(12,original.y+e.clientY-startY)};
        const next=positions[character.id];card.style.left=next.x+'px';card.style.top=next.y+'px';
        drawTreeLines(edges,positions,width,height);
        highlightTarget();
      };
      const finish=e=>{
        if(e.pointerId!==event.pointerId)return;
        drag.removeEventListener('pointermove',move);
        drag.removeEventListener('pointerup',finish);
        drag.removeEventListener('pointercancel',finish);
        const next=positions[character.id];
        if(e.type==='pointercancel' || !moved){
          positions[character.id]=original;card.style.left=original.x+'px';card.style.top=original.y+'px';
          drawTreeLines(edges,positions,width,height);
          container.querySelectorAll('.linkTarget').forEach(n=>n.classList.remove('linkTarget'));
          return;
        }
        const target=highlightTarget();
        container.querySelectorAll('.linkTarget').forEach(n=>n.classList.remove('linkTarget'));
        if(target){
          // A card-to-card drop is a link gesture, not an overlapping saved position.
          positions[character.id]=original;card.style.left=original.x+'px';card.style.top=original.y+'px';
          drawTreeLines(edges,positions,width,height);
          const edge=edges.find(c=>c.key===[character.id,target.id].sort().join('|'));
          void (async()=>{
            const type=await askTreeDrop(character,target,edge);
            if(type===null)return;
            if(edge)await setTreeConnectionType(edge,type);
            else await addTreeConnections(character.id,[target.id],type);
          })();
        }else if(next.x!==original.x||next.y!==original.y){
          state.treeMeta.positions[character.id]={...next};queueTreeSave();
          rememberUndo('Move character card',async()=>{
            if(undoPosition)state.treeMeta.positions[character.id]={...undoPosition};
            else delete state.treeMeta.positions[character.id];
            queueTreeSave();if(!(await flushTree()))return false;
            if(!$('treeView').classList.contains('hidden'))renderTree();
            return true;
          });
        }
      };
      drag.addEventListener('pointermove',move);drag.addEventListener('pointerup',finish);drag.addEventListener('pointercancel',finish);
    });
  }
  const list=$('treeConnectionList');list.replaceChildren();
  if(!edges.length)list.append(el('p','muted','No connections yet. All characters are shown above. You can connect them using the controls below or their profile relationships.'));
  for(const edge of edges){
    const a=state.characters.find(x=>x.id===edge.from),b=state.characters.find(x=>x.id===edge.to);
    const row=el('div','treeConnectionRow');
    row.append(el('span','treeConnectionNames',`${a.name} → ${b.name}`));
    const select=el('select');select.setAttribute('aria-label',`Relationship between ${a.name} and ${b.name}`);
    addTypes(select,edge.type);select.addEventListener('change',()=>void setTreeConnectionType(edge,select.value));
    const remove=el('button','treeRemoveBtn','Remove link');remove.type='button';
    remove.addEventListener('click',()=>void removeTreeConnection(edge));
    row.append(select,remove);list.append(row);
  }
  const source=$('treeFrom'),was=source.value;source.replaceChildren(new Option('Choose character…',''));
  for(const c of state.characters)source.add(new Option(c.name,c.id));
  if(state.characters.some(c=>c.id===was))source.value=was;
  const targets=$('treeTargets'), checked=new Set([...targets.querySelectorAll('input:checked')].map(input=>input.value));
  targets.replaceChildren();
  for(const c of state.characters){
    if(c.id===source.value)continue;
    const lab=el('label','treeTargetOption');
    const input=el('input');input.type='checkbox';input.value=c.id;input.checked=checked.has(c.id);
    lab.append(input,el('span','',c.name));targets.append(lab);
  }
  $('treeNewType').replaceChildren();addTypes($('treeNewType'));
  $('treeConnectBtn').disabled=state.characters.length<2;
}
async function showTree() {
  if(!(await flush())){toast('Save your changes before opening the tree.',true);return;}
  if(!state.novel){await showBookshelf();return;}
  hideMainViews();cleanGalleryUrls();
  $('treeView').classList.remove('hidden');
  $('treeViewTitle').textContent=state.novel.name+' · Character Tree';
  $('treeSaveLabel').textContent=treeUnsaved()?'Unsaved layout changes':'Layout ready';
  $('treeSaveLabel').dataset.kind=treeUnsaved()?'busy':'';
  setActiveSidebarNavigation('');setWorkspaceView('tree');
  renderTree();
}
async function resetTreeLayout() {
  if(!state.novel || !confirm('Reset all manually arranged tree positions for this novel? Character profiles and connections will remain unchanged.'))return;
  const before=structuredClone(state.treeMeta.positions);
  state.treeMeta.positions={};queueTreeSave();renderTree();
  rememberUndo('Reset tree layout',async()=>{state.treeMeta.positions=structuredClone(before);queueTreeSave();if(!(await flushTree()))return false;if(!$('treeView').classList.contains('hidden'))renderTree();return true;});
}

/* v3.6: Structured Timeline — single event record shared across novel-wide
   and filtered character views. Freeform character notes are NEVER parsed. */
async function loadTimelineEvents(directory) {
  try {
    const data=await readJSON(await directory.getFileHandle('timeline.json'));
    if(data.type!=='character-bookshelf-timeline' || !Array.isArray(data.events))throw Error('Invalid timeline.json; nothing was modified.');
    return data.events.map((e,i)=>({id:String(e.id),title:String(e.title||'Untitled event'),year:e.year===null||e.year===undefined||e.year===''?null:Number(e.year),dateText:String(e.dateText||''),notes:String(e.notes||''),characterIds:Array.isArray(e.characterIds)?e.characterIds.map(String):[],order:Number.isFinite(Number(e.order))?Number(e.order):i,createdAt:e.createdAt||dateNow()}));
  } catch(e){if(e.name==='NotFoundError')return [];throw e;}
}
async function writeTimeline(next, label='Timeline updated', old=null, scope=pageUndoKey()) {
  if(!state.novelDir)throw Error('Choose a novel.');
  const before=structuredClone(old||state.timelineEvents);
  await putJSON(state.novelDir,'timeline.json',{type:'character-bookshelf-timeline',version:1,events:next});
  state.timelineEvents=structuredClone(next);
  rememberUndo(label,async()=>{
    await putJSON(state.novelDir,'timeline.json',{type:'character-bookshelf-timeline',version:1,events:before});
    state.timelineEvents=structuredClone(before);
    if(pageType()==='timeline')renderTimeline();
    if(pageType()==='editor' && state.active)renderEditor();
    return true;
  },null,scope);
  status('Saved to folder');
}
function eventYearKey(event) {return event.year===null||!Number.isFinite(event.year)?'undated':String(event.year);}
function sortedTimelineEvents(events) {
  return [...events].sort((a,b)=>{
    const ya=eventYearKey(a),yb=eventYearKey(b);
    if(ya==='undated'&&yb!=='undated')return 1;
    if(yb==='undated'&&ya!=='undated')return -1;
    if(ya!==yb)return Number(ya)-Number(yb);
    return (a.order??0)-(b.order??0)||a.title.localeCompare(b.title);
  });
}
function renderCharacterTimelineEvents(host,character) {
  const block=el('div','characterTimelineBlock');
  const heading=el('div','characterTimelineHeading');
  heading.append(el('h3','','Timeline events'));
  const add=el('button','quiet','＋ Add event');add.type='button';
  add.onclick=()=>openTimelineEventDialog(null,character.id);
  heading.append(add);block.append(heading);
  const entries=sortedTimelineEvents(state.timelineEvents.filter(e=>e.characterIds.includes(character.id)));
  if(!entries.length)block.append(el('p','muted','No structured timeline events for this character. Add one here or link this character to an event on the novel timeline. Your existing Important Events notes remain unchanged.'));
  for(const entry of entries){
    const btn=el('button','characterEventButton', (entry.year??'Undated')+' · '+entry.title);
    btn.type='button';btn.onclick=async()=>{await showTimeline();openTimelineEventDialog(entry.id);};
    block.append(btn);
  }
  const all=el('button','textButton','View novel timeline →');all.type='button';all.onclick=()=>void showTimeline();block.append(all);
  host.append(block);
}
function openTimelineEventDialog(id=null,prefillCharacterId=null) {
  if(!state.novel)return;
  const event=state.timelineEvents.find(e=>e.id===id)||null;
  const dialog=$('timelineEventDialog');
  dialog.dataset.eventId=event?.id||'';
  dialog.dataset.origin=pageType();
  $('timelineDialogHeading').textContent=event?'Edit Timeline Event':'Add Timeline Event';
  $('eventTitleInput').value=event?.title||'';
  $('eventYearInput').value=event?.year??'';
  $('eventDateInput').value=event?.dateText||'';
  $('eventNotesInput').value=event?.notes||'';
  const host=$('eventCharacterChoices');host.replaceChildren();
  for(const c of state.characters){
    const label=el('label','eventCharacterChoice');const check=el('input');check.type='checkbox';check.value=c.id;
    check.checked=event?event.characterIds.includes(c.id):prefillCharacterId===c.id;
    label.append(check,el('span','',c.name));host.append(label);
  }
  dialog.showModal();$('eventTitleInput').focus();
}
async function saveTimelineEvent(evt) {
  evt.preventDefault();
  const title=cleanName($('eventTitleInput').value);
  if(!title){$('eventTitleInput').focus();return;}
  const rawYear=$('eventYearInput').value.trim();
  const year=rawYear===''?null:Number(rawYear);
  if(year!==null && (!Number.isInteger(year)||year < -9999||year > 9999)){toast('Enter a year from -9999 to 9999, or leave it blank.',true);return;}
  const id=$('timelineEventDialog').dataset.eventId;
  const original=state.timelineEvents.find(e=>e.id===id);
  const before=structuredClone(state.timelineEvents);
  const selected=[...$('eventCharacterChoices').querySelectorAll('input:checked')].map(x=>x.value);
  const changed={id:original?.id||randomId(),title,year,dateText:cleanName($('eventDateInput').value),notes:$('eventNotesInput').value,characterIds:selected,order:original?.order??(Math.max(-1,...state.timelineEvents.filter(e=>eventYearKey(e)===(year===null?'undated':String(year))).map(e=>e.order||0))+1),createdAt:original?.createdAt||dateNow()};
  const next=original?state.timelineEvents.map(e=>e.id===original.id?changed:e):[...state.timelineEvents,changed];
  try{
    if(!(await flush()))throw Error('Please save your character changes first.');
    await writeTimeline(next,original?'Edit event':'Add event',before,pageUndoKey($('timelineEventDialog').dataset.origin||'timeline'));
    $('timelineEventDialog').close();
    if(pageType()==='timeline')renderTimeline();
    if(pageType()==='editor' && state.active)renderEditor();
    toast('Timeline event saved to USB.');
  }catch(e){toast('Could not save event: '+e.message,true);}
}
async function deleteTimelineEvent(id){
  const event=state.timelineEvents.find(e=>e.id===id);if(!event)return;
  if(!confirm('Delete timeline event “'+event.title+'”? This removes it from every linked character timeline.'))return;
  try{await writeTimeline(state.timelineEvents.filter(e=>e.id!==id),'Delete event');renderTimeline();}
  catch(e){toast('Delete failed: '+e.message,true);}
}
async function moveTimelineEvent(id,direction){
  const view=sortedTimelineEvents(state.timelineEvents);
  const at=view.findIndex(e=>e.id===id);if(at<0)return;
  const current=view[at],near=view[at+direction];
  if(!near||eventYearKey(current)!==eventYearKey(near))return;
  const before=structuredClone(state.timelineEvents);
  const group=view.filter(e=>eventYearKey(e)===eventYearKey(current));
  const idx=group.findIndex(e=>e.id===id);if(idx+direction<0||idx+direction>=group.length)return;
  [group[idx],group[idx+direction]]=[group[idx+direction],group[idx]];
  const ord=new Map(group.map((e,i)=>[e.id,i]));
  const next=state.timelineEvents.map(e=>ord.has(e.id)?{...e,order:ord.get(e.id)}:e);
  try{await writeTimeline(next,'Reorder events',before);renderTimeline();}
  catch(e){toast('Could not reorder events: '+e.message,true);}
}
async function dragTimelineEvent(sourceId,targetId) {
  if(sourceId===targetId)return;
  const sorted=sortedTimelineEvents(state.timelineEvents);
  const source=sorted.find(e=>e.id===sourceId),target=sorted.find(e=>e.id===targetId);
  if(!source||!target||eventYearKey(source)!==eventYearKey(target)){
    toast('Change the year first to move an event into another year.',true);return;
  }
  const before=structuredClone(state.timelineEvents),group=sorted.filter(e=>eventYearKey(e)===eventYearKey(source));
  const from=group.findIndex(e=>e.id===sourceId),to=group.findIndex(e=>e.id===targetId);
  const [removed]=group.splice(from,1);group.splice(to,0,removed);
  const orders=new Map(group.map((e,i)=>[e.id,i]));
  try {await writeTimeline(state.timelineEvents.map(e=>orders.has(e.id)?{...e,order:orders.get(e.id)}:e),'Reorder events',before);renderTimeline();}
  catch(e){toast('Timeline reorder failed: '+e.message,true);}
}
function renderTimeline(){
  if(!state.novel)return;
  $('timelineViewTitle').textContent=state.novel.name+' · Timeline';
  const picker=$('timelineCharacterFilter');const previous=state.timelineFilter||'all';picker.replaceChildren();
  for(const c of state.characters)picker.add(new Option(c.name,c.id));
  const byCharacter=previous!=='all';
  if(byCharacter && !state.characters.some(c=>c.id===previous))state.timelineFilter='all';
  picker.value=state.timelineFilter==='all'?(state.characters[0]?.id||''):state.timelineFilter;
  $('timelineAllMode').classList.toggle('selected',state.timelineFilter==='all');
  $('timelineCharacterMode').classList.toggle('selected',state.timelineFilter!=='all');
  $('timelineFilterWrap').classList.toggle('hidden',state.timelineFilter==='all');
  const visible=sortedTimelineEvents(state.timelineEvents.filter(e=>state.timelineFilter==='all'||e.characterIds.includes(state.timelineFilter)));
  $('timelineEventCount').textContent=visible.length+' event'+(visible.length===1?'':'s');
  const host=$('timelineEntries');host.replaceChildren();
  if(!visible.length){host.append(el('div','noCharacters',state.timelineFilter==='all'?'No timeline events yet. Add your first event to begin.':'No events linked to this character yet.'));return;}
  const groups=new Map();for(const e of visible){const key=eventYearKey(e);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e);}
  for(const [key,events] of groups){
    const group=el('section','timelineGroup');group.append(el('h2','timelineYear',key==='undated'?'Relative / Unknown Dates':key));
    const rail=el('div','timelineRail');
    for(const event of events){
      const row=el('div','timelineRow');
      const bullet=el('span','timelineBullet','');
      const card=el('div','timelineCard');
      card.draggable=true;
      card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',event.id);e.dataTransfer.effectAllowed='move';});
      card.addEventListener('dragover',e=>{e.preventDefault();card.classList.add('dragOver');});
      card.addEventListener('dragleave',()=>card.classList.remove('dragOver'));
      card.addEventListener('drop',e=>{e.preventDefault();card.classList.remove('dragOver');void dragTimelineEvent(e.dataTransfer.getData('text/plain'),event.id);});
      card.addEventListener('dragend',()=>document.querySelectorAll('.timelineCard.dragOver').forEach(c=>c.classList.remove('dragOver')));
      const content=el('button','timelineEventOpen');content.type='button';
      content.append(el('strong','',event.title));
      if(event.dateText)content.append(el('span','muted',event.dateText));
      if(event.notes)content.append(el('span','timelineExcerpt',event.notes.slice(0,160)));
      const names=event.characterIds.map(id=>state.characters.find(c=>c.id===id)?.name).filter(Boolean);
      content.append(el('span','timelineTags',names.length?names.join(' · '):'No characters assigned'));
      content.onclick=()=>openTimelineEventDialog(event.id);
      const controls=el('div','timelineRowActions');
      for(const [symbol,d] of [['↑',-1],['↓',1]]){
        const b=el('button','quiet',symbol);b.type='button';b.title=(d<0?'Move earlier':'Move later')+' within year';
        const idx=events.indexOf(event);b.disabled=d<0?idx===0:idx===events.length-1;
        b.onclick=()=>void moveTimelineEvent(event.id,d);controls.append(b);
      }
      const remove=el('button','dangerText','×');remove.title='Delete timeline event';remove.onclick=()=>void deleteTimelineEvent(event.id);controls.append(remove);
      card.append(content,controls);row.append(bullet,card);rail.append(row);
    }
    group.append(rail);host.append(group);
  }
}
async function showTimeline(){
  if(!(await flush()))return;
  if(!state.novel)return;
  hideMainViews();cleanGalleryUrls();$('timelineView').classList.remove('hidden');
  setWorkspaceView('timeline');renderTimeline();
}
/* v3.8: Whole-word, within-writer search. Search only the selected writer's folder. */
async function showLibrarySearch(){
  if(!(await flush()))return;
  if(!state.writer)return;
  hideMainViews();cleanGalleryUrls();$('librarySearchView').classList.remove('hidden');
  setWorkspaceView('search');
  if($('globalSearchInput').value.trim())await runLibrarySearch();
}
function matchWholeWord(value,query){
  // Unicode letter/digit boundaries reject 'Ron' within 'chronic', but accept Ron's.
  const source=String(value??'');if(!query||!source)return -1;
  const hay=source.toLocaleLowerCase(),needle=query.toLocaleLowerCase();
  let from=0;
  while(from<hay.length){
    const at=hay.indexOf(needle,from);if(at<0)return -1;
    const previous=at>0?source[at-1]:'';
    const following=source[at+needle.length]||'';
    if((!previous||!/[\p{L}\p{N}]/u.test(previous))&&(!following||!/[\p{L}\p{N}]/u.test(following)))return at;
    from=at+1;
  }
  return -1;
}
function collectSearchableParts(profile,lookup){
  const parts=[{label:'Character name',value:profile.name,section:'basic',key:'fullName',priority:0}];
  for(const section of sections){
    const object=profile[section.key]||{};
    for(const [key,value] of Object.entries(object)){
      if(key==='links'&&Array.isArray(value)){
        for(const link of value){
          if(lookup.has(link.id))parts.push({label:'Related character',value:lookup.get(link.id),section:'relationships',key:'links',priority:2});
          if(link.notes)parts.push({label:'Relationship notes',value:link.notes,section:'relationships',key:'links',priority:3});
        }
      }else if(typeof value==='string')parts.push({label:section.title+' / '+key,value,section:section.key,key,priority:key==='fullName'?0:section.key==='story'?2:3});
    }
  }
  return parts;
}
function searchExcerpt(value,at,len){
  const source=String(value||'');return source.slice(Math.max(0,at-65),Math.min(source.length,at+len+100));
}
function highlightSearchTarget(match,term){
  let node=null;
  if(match.section==='relationships')node=$('section-relationships');
  else node=[...$('sections').querySelectorAll('.field')].find(f=>f.dataset.section===match.section&&f.dataset.field===match.key);
  if(!node)return;
  const section=node.closest('details');if(section)section.open=true;
  node.classList.add('searchTarget');node.scrollIntoView({block:'center',behavior:'smooth'});
  const input=node.querySelector('textarea,input');
  if(input){const at=matchWholeWord(input.value,term);if(at>=0){input.focus({preventScroll:true});try{input.setSelectionRange(at,at+term.length);}catch{}}}
  setTimeout(()=>node.classList.remove('searchTarget'),6500);
}
async function runLibrarySearch(){
  const text=$('globalSearchInput').value.trim();
  const host=$('searchResults');host.replaceChildren();
  if(!text){host.append(el('p','muted','Enter a word or phrase to search this writer’s library.'));return;}
  const token=++state.searchEpoch,writerId=state.writer?.id;
  host.append(el('p','muted','Searching character profiles, relationships, books, and timelines…'));
  const matches=[];
  try{
    for(const novel of state.novels){
      const dir=await state.writerDir.getDirectoryHandle(novel.folder),chars=await dir.getDirectoryHandle('characters');
      const profiles=[];
      for await(const [name,handle] of chars.entries()){
        if(handle.kind!=='file'||!name.toLowerCase().endsWith('.json'))continue;
        profiles.push(await readJSON(handle));
      }
      const lookup=new Map(profiles.map(p=>[p.id,p.name]));
      const titleAt=matchWholeWord(novel.name,text);
      if(titleAt>=0)matches.push({kind:'book',novel,match:{label:'Novel title',value:novel.name,priority:0,at:titleAt}});
      for(const profile of profiles){
        const hits=collectSearchableParts(profile,lookup).map(part=>({...part,at:matchWholeWord(part.value,text)})).filter(part=>part.at>=0).sort((a,b)=>a.priority-b.priority);
        if(hits.length)matches.push({kind:'character',novel,profile,match:hits[0]});
      }
      const events=await loadTimelineEvents(dir);
      for(const event of events){
        const fields=[['Event title',event.title,'title',1],['Event notes',event.notes,'notes',3],['Event date',event.dateText,'dateText',3]];
        for(const [label,value,key,priority] of fields){
          const at=matchWholeWord(value,text);
          if(at>=0){matches.push({kind:'event',novel,event,match:{label,value,key,priority,at}});break;}
        }
      }
    }
    if(token!==state.searchEpoch||pageType()!=='search'||writerId!==state.writer?.id)return;
    matches.sort((a,b)=>a.match.priority-b.match.priority||a.novel.name.localeCompare(b.novel.name));
    const booksMatched=new Set(matches.map(m=>m.novel.id)).size;
    host.replaceChildren(el('p','searchSummary',matches.length+' result'+(matches.length===1?'':'s')+' across '+booksMatched+' matching book'+(booksMatched===1?'':'s')));
    if(!matches.length)host.append(el('p','muted','No whole-word matches. Try another word or phrase.'));
    const groups=new Map();for(const result of matches.slice(0,200)){
      if(!groups.has(result.novel.id))groups.set(result.novel.id,[]);groups.get(result.novel.id).push(result);
    }
    for(const [id,results] of groups){
      const group=el('section','searchResultGroup');group.append(el('h3','',results[0].novel.name));
      for(const result of results){
        const button=el('button','searchHit');button.type='button';
        button.append(el('strong','',result.kind==='book'?result.novel.name:result.kind==='event'?result.event.title:result.profile.name));
        button.append(el('span','muted',result.match.label));
        const excerpt=el('span','searchExcerpt');
        const value=String(result.match.value||''),at=result.match.at;
        const start=Math.max(0,at-65),end=Math.min(value.length,at+text.length+100);
        excerpt.append(document.createTextNode(value.slice(start,at)));
        excerpt.append(el('mark','',value.slice(at,at+text.length)));
        excerpt.append(document.createTextNode(value.slice(at+text.length,end)));
        button.append(excerpt);
        button.onclick=async()=>{
          await chooseNovel(result.novel.id);
          if(result.kind==='book')return;
          if(result.kind==='character'){
            await chooseCharacter(result.profile.id);
            highlightSearchTarget(result.match,text);
          }else{
            await showTimeline();openTimelineEventDialog(result.event.id);
            const fieldId={title:'eventTitleInput',notes:'eventNotesInput',dateText:'eventDateInput'}[result.match.key];
            const field=$(fieldId);if(field){const at=matchWholeWord(field.value,text);field.classList.add('searchTarget');field.focus();if(at>=0)field.setSelectionRange(at,at+text.length);setTimeout(()=>field.classList.remove('searchTarget'),6500);}
          }
        };
        group.append(button);
      }
      host.append(group);
    }
    if(matches.length>200)host.append(el('p','muted','Showing first 200 results. Narrow your search for more.'));
  }catch(e){if(token!==state.searchEpoch)return;host.replaceChildren(el('p','errorText','Search could not complete: '+e.message));}
}
/* v3.6: Upload-only book cover. The bitmap stays on the USB in its novel. */
function cleanCoverUrls(){for(const u of state.coverUrls||[])URL.revokeObjectURL(u);state.coverUrls=[];}
async function showBookCover(novel, frame){
  if(!novel.coverFile || !state.writerDir)return;
  try{
    const dir=await state.writerDir.getDirectoryHandle(novel.folder);
    const file=await(await dir.getFileHandle(novel.coverFile)).getFile();
    if(!frame.isConnected)return;
    const url=URL.createObjectURL(file);state.coverUrls.push(url);
    frame.replaceChildren();const img=el('img','uploadedBookImage');img.src=url;img.alt='';frame.append(img);
  }catch(e){console.warn('Could not load cover:',e);}
}
async function uploadBookCover(evt){
  const file=evt.target.files?.[0];evt.target.value='';if(!file||!state.novel)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10*1024*1024){toast('Choose a JPG, PNG, or WebP image under 10 MB.',true);return;}
  if(!(await flush()))return;
  const novel=state.novel,old=novel.coverFile;
  const next='cover.'+({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[file.type]);
  try{
    await putFile(state.novelDir,next,file);
    const updated={...novel,coverFile:next};delete updated.folder;
    await putJSON(state.novelDir,'novel.json',updated);
    novel.coverFile=next;
    if(old && old!==next){try{await removeTrackedEntry(state.novelDir,old);}catch(e){toast('New cover saved, but old cover cleanup failed.',true);}}
    $('removeCoverBtn').disabled=false;toast('Book cover saved to USB.');
  }catch(e){toast('Cover upload failed: '+e.message,true);}
}
async function removeBookCover(){
  if(!state.novel?.coverFile)return;
  if(!confirm('Remove the uploaded book cover? The default cover will be shown again.'))return;
  const novel=state.novel,previous=novel.coverFile;
  const clean={...novel,coverFile:null};delete clean.folder;
  try{await putJSON(state.novelDir,'novel.json',clean);novel.coverFile=null;
    try{await removeTrackedEntry(state.novelDir,previous);}catch(e){toast('Cover hidden, but the old image could not be deleted: '+e.message,true);}
    $('removeCoverBtn').disabled=true;toast('Restored default book cover.');
  }catch(e){toast('Could not remove cover: '+e.message,true);}
}
/* v3.6: complete tree export, including offscreen manually arranged nodes. */
function exportTreeSVG(){
  const connections=treeConnections(),positions=treePositions(connections);
  const w=Math.max(940,...Object.values(positions).map(p=>Math.ceil(p.x+240)));
  const nodeHeight=Math.max(340,...Object.values(positions).map(p=>Math.ceil(p.y+150)));
  const h=nodeHeight+(connections.length?85+connections.length*25:40);
  const lines=connections.map(edge=>{
    const a=positions[edge.from],b=positions[edge.to];if(!a||!b)return '';
    const x1=a.x+90,y1=a.y+48,x2=b.x+90,y2=b.y+48;
    return `<path d="M${x1} ${y1} C${(x1+x2)/2} ${y1},${(x1+x2)/2} ${y2},${x2} ${y2}" stroke="#91c5fa" stroke-width="3.5" fill="none"/>`;
  }).join('');
  const nodes=state.characters.map(c=>{
    const p=positions[c.id];if(!p)return '';
    return `<g transform="translate(${p.x} ${p.y})"><rect width="180" height="96" rx="12" fill="#20364e" stroke="#7d9fc7" stroke-width="2"/><text x="14" y="35" fill="#f7faff" font-size="15" font-family="Arial,sans-serif" font-weight="bold">${safeXml(c.name.slice(0,65))}</text><text x="14" y="62" fill="#b8cee5" font-size="12" font-family="Arial,sans-serif">${safeXml((c.story?.role||'Character').slice(0,65))}</text></g>`;
  }).join('');
  const legend=connections.length?
    `<line x1="22" x2="${w-22}" y1="${nodeHeight+8}" y2="${nodeHeight+8}" stroke="#547394" stroke-width="1"/><text x="24" y="${nodeHeight+33}" fill="#e3f0ff" font-family="Arial,sans-serif" font-size="17" font-weight="bold">Relationships</text>`+
    connections.map((edge,i)=>{
      const a=state.characters.find(c=>c.id===edge.from),b=state.characters.find(c=>c.id===edge.to);
      return `<text x="25" y="${nodeHeight+58+i*25}" fill="#cfe2f7" font-family="Arial,sans-serif" font-size="14">${safeXml((a?.name||'?')+' — '+treeTypeName(edge.type)+' — '+(b?.name||'?'))}</text>`;
    }).join(''):'';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="#101a28"/>${lines}${nodes}${legend}</svg>`;
}
async function treePNGBlob(){
  const svg=exportTreeSVG(),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  try{
    const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Image could not be rendered'));img.src=url;});
    const scale=Math.min(2,8192/Math.max(img.width,img.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw Error('PNG encoder failed');return blob;
  }finally{URL.revokeObjectURL(url);}
}
async function exportTreePNG(){
  if(!state.novel||!(await flush()))return;
  try{const blob=await treePNGBlob();downloadBlob(blob,folderSafe(state.novel.name)+'-character-tree.png');toast('Full character tree exported as PNG.');}
  catch(e){toast('Tree export failed: '+e.message,true);}
}
async function exportTreePDF(){
  if(!state.novel)return;
  const popup=window.open('','_blank');
  if(!popup){toast('Allow popups for the printable PDF.',true);return;}
  popup.document.write('<p style="font-family:sans-serif;padding:30px">Preparing your tree…</p>');
  try{
    if(!(await flush()))throw Error('Save changes first.');
    const png=await treePNGBlob();const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(png);});
    popup.document.open();popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safeHtml(state.novel.name)} — Character Tree</title><style>@page{size:landscape;margin:.4in}body{font:14px Arial;color:#243346}h1{font-size:19px;margin:0 0 10px}img{display:block;max-width:100%;max-height:85vh;object-fit:contain;margin:auto}@media print{button{display:none}}</style></head><body><h1>${safeHtml(state.novel.name)} — Character Tree</h1><button onclick="window.print()">Print / Save as PDF</button><img src="${data}" alt="Character tree"></body></html>`);popup.document.close();
    popup.focus();toast('Tree print view opened. Choose Save as PDF in the print dialog.');
  }catch(e){popup.close();toast('Tree PDF failed: '+e.message,true);}
}

/* Character export tools. No external libraries or network APIs.
   PDF uses the browser's Print > Save as PDF. Word is a genuine .docx ZIP package. */
function safeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function safeXml(value) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
}
function exportCollection(scope) {
  if (scope === 'novel') return [...state.characters].sort((a,b) => a.name.localeCompare(b.name));
  return state.active ? [state.active] : [];
}
function exportLabel(scope) {
  return scope === 'novel' ? (state.novel?.name || 'Novel') + ' - Character Collection' : (state.active?.name || 'Character');
}
function exportSections(character) {
  return sections.map(section => {
    const data = character[section.key] || {};
    const entries = section.fields.map(([key,label]) => ({label, value: String(data[key] ?? '').trim()}));
    if (section.key === 'relationships') {
      for (const link of relatedCharacters(character)) {
        const target = state.characters.find(c => c.id === link.id);
        if (!target) continue;
        entries.push({label:'Linked character',value: target.name + (link.incoming ? ' (linked from their profile)' : '') + (link.type ? ' — ' + treeTypeName(link.type) : '')});
        if (link.notes?.trim()) entries.push({label:'Relationship notes about '+target.name,value:link.notes.trim()});
      }
    }
    if (data.notes?.trim()) entries.push({label: section.key === 'freeform' ? 'Notes' : 'Additional notes',value:data.notes.trim()});
    return {title:section.title, entries};
  });
}
async function portraitAsPNG(character) {
  if (!character.portraitFile || !state.portraitsDir) return null;
  try {
    const file = await (await state.portraitsDir.getFileHandle(character.portraitFile)).getFile();
    const bitmap = await createImageBitmap(file);
    try {
      const max = 480;
      const ratio = Math.min(1, max / Math.max(bitmap.width,bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1,Math.round(bitmap.width*ratio));
      canvas.height = Math.max(1,Math.round(bitmap.height*ratio));
      canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
      const png = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!png) return null;
      return new Uint8Array(await png.arrayBuffer());
    } finally { bitmap.close(); }
  } catch (error) {
    console.warn('Portrait could not be included in export:', error);
    return null;
  }
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 20000);
}
async function exportPdf(scope) {
  if (!state.novel) return;
  // Open synchronously in the click handler's activation window to avoid popup blocking.
  const popup = window.open('', '_blank');
  if (!popup) { toast('Please allow pop-ups for this site to export a PDF.', true); return; }
  popup.document.write('<!doctype html><title>Preparing character export...</title><p style="font-family:sans-serif;padding:32px">Preparing printable character sheets...</p>');
  try {
    if (!(await flush())) throw new Error('Save the current character before exporting.');
    const items = exportCollection(scope);
    if (!items.length) throw new Error('No characters to export.');
    const portraitUrls = [];
    const pages = [];
    for (const character of items) {
      const png = await portraitAsPNG(character);
      const blob = png ? new Blob([png],{type:'image/png'}) : null;
      const portrait = blob ? await new Promise(resolve => {
        const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => resolve(null); r.readAsDataURL(blob);
      }) : null;
      if (portrait) portraitUrls.push(portrait);
      const parts = [];
      for (const section of exportSections(character)) {
        const rows = section.entries.filter(r => r.value).map(r => `<div class="field"><div class="key">${safeHtml(r.label)}</div><div class="value">${safeHtml(r.value).replace(/\r?\n/g,'<br>')}</div></div>`).join('');
        parts.push(`<section><h2>${safeHtml(section.title)}</h2>${rows || '<p class="empty">Not yet documented.</p>'}</section>`);
      }
      pages.push(`<article class="person"><header><div><div class="kicker">CHARACTER BOOKSHELF · ${safeHtml(state.novel.name)}</div><h1>${safeHtml(character.name)}</h1><p>Character profile</p></div>${portrait?`<img src="${portrait}" alt="">`:''}</header>${parts.join('')}</article>`);
    }
    const title = safeHtml(exportLabel(scope));
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
      @page{size:letter;margin:0.72in}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#202b38;background:#fff;margin:0}
      .person{page-break-after:always;break-after:page}.person:last-child{page-break-after:auto;break-after:auto}
      header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;border-bottom:3px solid #344d6f;padding-bottom:18px;margin-bottom:22px}
      header img{width:105px;max-height:145px;object-fit:cover;border:1px solid #bac8d7;border-radius:5px}
      h1{font-size:29px;margin:6px 0 8px}header p{color:#637085;margin:0}.kicker{letter-spacing:1.6px;font-size:10px;color:#59779c;font-weight:700}
      section{break-inside:avoid;margin:0 0 22px}section h2{font-size:14px;color:#29466a;border-bottom:1px solid #cad4df;padding-bottom:6px;margin:0 0 12px}
      .field{margin:0 0 10px;break-inside:avoid}.key{font-size:10px;font-weight:bold;color:#536479;text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px}
      .value{font-size:12px;line-height:1.55;overflow-wrap:anywhere;white-space:normal}.empty{color:#8793a2;font-size:11px;font-style:italic}
      @media screen{body{background:#e9eef4;padding:30px}.person{max-width:850px;margin:0 auto 25px;background:#fff;padding:55px;box-shadow:0 8px 35px #192b3e2b}}
      </style></head><body>${pages.join('')}<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),500));</script></body></html>`;
    popup.document.open(); popup.document.write(html); popup.document.close();
    toast('Print window opened. Choose “Save as PDF” as the destination.');
  } catch(error) {
    popup.document.open(); popup.document.write('<p style="font-family:Arial;padding:24px">Export could not complete: '+safeHtml(error.message)+'</p>'); popup.document.close();
    toast('PDF export failed: ' + error.message, true);
  }
}

/* Minimal ZIP writer (STORE method) for standalone DOCX exports. */
const utf8 = new TextEncoder();
function crc32(bytes) {
  let crc = -1;
  for (const byte of bytes) {
    crc ^= byte;
    for (let k=0;k<8;k++) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}
function zipBytes(files) {
  const parts = [], central = [];
  let offset = 0;
  const u16 = (view,off,n)=>view.setUint16(off,n,true);
  const u32 = (view,off,n)=>view.setUint32(off,n>>>0,true);
  for (const [name,raw] of files) {
    const filename = utf8.encode(name);
    const data = typeof raw === 'string' ? utf8.encode(raw) : raw;
    const crc = crc32(data);
    const local = new Uint8Array(30+filename.length);
    const a = new DataView(local.buffer);
    u32(a,0,0x04034b50);u16(a,4,20);u16(a,6,0x0800);u16(a,8,0);u32(a,14,crc);u32(a,18,data.length);u32(a,22,data.length);u16(a,26,filename.length);
    local.set(filename,30);
    parts.push(local,data);
    const cd = new Uint8Array(46+filename.length);
    const v = new DataView(cd.buffer);
    u32(v,0,0x02014b50);u16(v,4,20);u16(v,6,20);u16(v,8,0x0800);u16(v,10,0);
    u32(v,16,crc);u32(v,20,data.length);u32(v,24,data.length);u16(v,28,filename.length);
    u32(v,42,offset);cd.set(filename,46);
    central.push(cd);offset += local.length+data.length;
  }
  const centralLen = central.reduce((n,part)=>n+part.length,0);
  const end = new Uint8Array(22), d = new DataView(end.buffer);
  u32(d,0,0x06054b50);u16(d,8,files.length);u16(d,10,files.length);u32(d,12,centralLen);u32(d,16,offset);
  return new Blob([...parts,...central,end],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
}
function wordRun(value,bold=false){
  const lines = String(value ?? '').split(/\r?\n/);
  return lines.map((line,i)=>`${i?'<w:br/>':''}<w:t xml:space="preserve">${safeXml(line)}</w:t>`).join('').replace(/^/,bold?'<w:r><w:rPr><w:b/></w:rPr>':'<w:r>')+'</w:r>';
}
function wordParagraph(value,style='') {
  const ppr = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : '';
  return `<w:p>${ppr}${wordRun(value)}</w:p>`;
}
function wordImage(rid,id) {
  return `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="1500000" cy="1500000"/><wp:docPr id="${id}" name="Character portrait"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="Portrait.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1500000" cy="1500000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}
async function exportDocx(scope) {
  try {
    if (!(await flush())) throw new Error('Save the current character before exporting.');
    const characters = exportCollection(scope);
    if (!characters.length) throw new Error('No characters to export.');
    toast('Preparing Word document…');
    const files = [];
    const imageRels = [];
    const paragraphs = scope === 'novel' ?
      [wordParagraph(exportLabel(scope), 'Title'), wordParagraph((state.writer?.name || '') + ' · Character Bookshelf', 'Subtitle')] :
      [wordParagraph((state.novel?.name || '') + ' · Character Bookshelf', 'Subtitle')];
    let imageId = 1;
    for (let i=0; i<characters.length; i++) {
      const character = characters[i];
      if (i) paragraphs.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
      paragraphs.push(wordParagraph(character.name,'Title'));
      const png = await portraitAsPNG(character);
      if (png) {
        const id='rIdPortrait'+(imageId);
        files.push(['word/media/portrait'+imageId+'.png',png]);
        imageRels.push(`<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/portrait${imageId}.png"/>`);
        paragraphs.push(wordImage(id,imageId));
        imageId++;
      }
      for (const section of exportSections(character)) {
        paragraphs.push(wordParagraph(section.title,'Heading1'));
        const entries = section.entries.filter(r=>r.value);
        if (!entries.length) { paragraphs.push(wordParagraph('Not yet documented.')); continue; }
        for (const field of entries) {
          paragraphs.push(`<w:p>${wordRun(field.label+': ',true)}${wordRun(field.value)}</w:p>`);
        }
      }
    }
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${paragraphs.join('')}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1000" w:right="1100" w:bottom="1000" w:left="1100"/></w:sectPr></w:body></w:document>`;
    files.push(['[Content_Types].xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`]);
    files.push(['_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>']);
    files.push(['word/document.xml',xml]);
    files.push(['word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:style w:type="paragraph" w:styleId="Normal" w:default="1"><w:name w:val="Normal"/><w:pPr><w:spacing w:after="110" w:line="270" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="21"/><w:color w:val="263342"/></w:rPr></w:style>
      <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="120" w:after="210"/></w:pPr><w:rPr><w:b/><w:sz w:val="38"/><w:color w:val="233F5E"/></w:rPr></w:style>
      <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="170"/></w:pPr><w:rPr><w:sz w:val="18"/><w:color w:val="687B91"/></w:rPr></w:style>
      <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="280" w:after="95"/><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="25"/><w:color w:val="2F5279"/></w:rPr></w:style>
      </w:styles>`]);
    files.push(['word/_rels/document.xml.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>${imageRels.join('')}</Relationships>`]);
    const blob = zipBytes(files);
    downloadBlob(blob,folderSafe(exportLabel(scope))+'.docx');
    toast('Word document exported.');
  } catch (error) { toast('Word export failed: ' + error.message,true); }
}

/* v3.7 — USB character update import. These modal editors stage changes in
   memory and never touch an existing file until the user explicitly saves. */
let pendingImport = null;
const IMPORT_MAX_BYTES = 1024 * 1024;
const IMPORT_FIELDS = [
  ['basic','Basic Information', [['fullName','Full name'],['age','Age / ages'],['occupation','Occupation'],['appearance','Physical appearance'],['notes','Additional notes']]],
  ['personality','Personality', [['traits','Personality traits'],['fears','Fears'],['beliefs','Beliefs'],['motivations','Motivations'],['notes','Additional notes']]],
  ['background','Background', [['history','Personal history'],['experiences','Significant experiences'],['notes','Additional notes']]],
  ['relationships','Relationships', [['notes','Relationship notes']]],
  ['story','Story Information', [['role','Role in story'],['timeline','Timeline'],['events','Important events'],['notes','Additional notes']]],
  ['freeform','Freeform Notes', [['notes','Notes']]]
];
const importFieldsArePlainObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
function importScalar(value, field) {
  if (typeof value === 'string') return value.slice(0, 100000);
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (value === null || value === undefined) return '';
  throw new Error('The imported field “' + field + '” must contain text, not an array or object.');
}
function normalizeCharacterImport(raw) {
  if (!importFieldsArePlainObject(raw)) throw new Error('The JSON must contain a character update object.');
  if (raw.format && raw.format !== 'character-bookshelf-update') {
    throw new Error('This file uses an unknown import format.');
  }
  if (raw.format && raw.version !== 1) throw new Error('Unsupported character update version.');
  const entity = importFieldsArePlainObject(raw.character) ? raw.character :
    importFieldsArePlainObject(raw.profile) ? raw.profile : raw;
  const info = importFieldsArePlainObject(raw.sections) ? raw.sections :
    importFieldsArePlainObject(entity.sections) ? entity.sections : entity;
  const name = cleanName(entity.name || info.basic?.fullName || raw.name).slice(0,100);
  if (!name) throw new Error('The imported character needs a name.');
  const incomingId = typeof entity.id === 'string' && entity.id.length < 160 ? entity.id : null;
  const fields = {};
  let fieldCount = 0;
  for (const [section, , keys] of IMPORT_FIELDS) {
    fields[section] = {};
    const source = info[section];
    if (source === undefined) continue;
    if (!importFieldsArePlainObject(source)) throw new Error('The “'+section+'” section must be an object.');
    for (const [key] of keys) {
      if (!Object.hasOwn(source,key)) continue;
      fields[section][key] = importScalar(source[key],section+'.'+key);
      fieldCount++;
    }
  }
  // A name is always provided. In updates, only explicitly present fields
  // are offered to the user, so missing properties never mean “delete”.
  if (!Object.hasOwn(fields.basic,'fullName') && !fieldCount) fields.basic.fullName = name;
  return {name,id:incomingId,fields,sourceIsComplete:raw.schema===1,warning:raw.relationships?.links?.length || entity.relationships?.links?.length ? 'Imported character ID links are not copied. Manage linked relationships in Character Tree.' : ''};
}
function importLookupName(name) {return cleanName(name).toLocaleLowerCase().replace(/\s+/g,' ');}
function importEditDistance(a,b) {
  if (Math.abs(a.length-b.length)>2) return 3;
  const previous=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++) {
    const row=[i];for(let j=1;j<=b.length;j++)
      row[j]=Math.min(previous[j]+1,row[j-1]+1,previous[j-1]+(a[i-1]===b[j-1]?0:1));
    for(let j=0;j<row.length;j++) previous[j]=row[j];
  }
  return previous[b.length];
}
function importNearMatch(left,right) {
  const a=importLookupName(left),b=importLookupName(right);
  if (!a || !b) return false;
  if (a===b) return true;
  // Flag close names for human review, not as proof of identity.
  if (a.length>=5 && b.length>=5 && (a.includes(b) || b.includes(a) || importEditDistance(a,b)<=2)) return true;
  const aa=a.split(' '), bb=b.split(' ');
  return aa.length>1 && bb.length>1 && aa[0]===bb[0] && aa[aa.length-1]===bb[bb.length-1];
}
function clearPendingImport() { pendingImport=null; }
function openImportPicker() {
  if (!state.novel || !state.charsDir) {toast('Choose a novel first.',true);return;}
  if (hasUnsaved() || !!state.saving || treeUnsaved() || !!state.treeSaving) {
    toast('Finish saving before opening an import. Try again after Saved to folder.',true);
    void flush();return;
  }
  // Keep the file picker inside the direct click gesture. Awaiting file writes
  // first can lose browser user activation and silently block the chooser.
  $('characterImportFile').value='';
  $('characterImportFile').click();
}
async function importCharacterFile(event) {
  const file = event.target.files?.[0];event.target.value='';
  if (!file) return;
  if (!state.novel) {toast('Select a novel first.',true);return;}
  if (file.size>IMPORT_MAX_BYTES) {toast('Import file must be under 1 MB.',true);return;}
  if (!/\.json$/i.test(file.name)) {toast('Choose a .json character update file.',true);return;}
  try {
    if (!(await flush())) return;
    const data=JSON.parse(await file.text());
    const parsed=normalizeCharacterImport(data);
    pendingImport={parsed,novelId:state.novel.id,writerId:state.writer.id};
    const matchedById=parsed.id ? state.characters.find(c=>c.id===parsed.id) : null;
    const matchedByName=state.characters.filter(c=>importLookupName(c.name)===importLookupName(parsed.name));
    if (matchedById && matchedByName.length && !matchedByName.includes(matchedById)) {
      showImportMatches([matchedById,...matchedByName]);return;
    }
    if (matchedById || matchedByName.length===1) {
      await openImportCompare(matchedById||matchedByName[0]);return;
    }
    if (matchedByName.length>1) {showImportMatches(matchedByName);return;}
    const similar=state.characters.filter(c=>importNearMatch(c.name,parsed.name));
    if (similar.length) showImportMatches(similar);
    else openImportedNewEditor();
  } catch(error) {clearPendingImport();toast('Import could not be opened: '+error.message,true);}
}
function showImportMatches(candidates) {
  if (!pendingImport) return;
  const host=$('importMatchList');host.replaceChildren();
  $('importMatchDescription').textContent='“'+pendingImport.parsed.name+'” may already exist in '+state.novel.name+'. Choose a character to compare, or intentionally create a new one.';
  for(const candidate of candidates) {
    const button=el('button','importMatchOption');button.type='button';button.textContent='Compare with '+candidate.name;
    button.onclick=()=>{$('importMatchDialog').close();void openImportCompare(candidate);};host.append(button);
  }
  $('importMatchDialog').showModal();
}
function importDraftFromCharacter(character) {
  const result=diskProfile(character);
  for (const [section,,keys] of IMPORT_FIELDS) {
    result[section] ??= {};
    for (const [key] of keys) result[section][key]=String(result[section][key] ?? '');
  }
  return result;
}
function addImportFieldGrid(host,model,proposal,editable=true) {
  for (const [section,title,keys] of IMPORT_FIELDS) {
    const proposalCount=editable ? keys.filter(([key])=>proposal?.[section] && Object.hasOwn(proposal[section],key)).length : 0;
    const group=el('details','importSection');group.open=editable ? proposalCount>0 : true;
    const summary=el('summary');summary.textContent=title+(editable ? ' · '+(proposalCount ? proposalCount+' proposed field'+(proposalCount>1?'s':'') : 'no proposed fields') : '');group.append(summary);
    const content=el('div','importSectionBody');
    const orderedKeys=editable ? [...keys.filter(([key])=>proposal?.[section] && Object.hasOwn(proposal[section],key)),...keys.filter(([key])=>!(proposal?.[section] && Object.hasOwn(proposal[section],key)))] : keys;
    for (const [key,label] of orderedKeys) {
      const row=el('div',editable?'importFieldPair':'importFieldSingle');
      const existing=el('label','importFieldCell');
      existing.append(el('span','importFieldName',label));
      const input=el(key==='fullName'||key==='age'||key==='occupation'||key==='role'?'input':'textarea','importExistingInput');
      if (input.tagName==='TEXTAREA') input.rows=3;
      input.value=model[section]?.[key] ?? '';
      input.addEventListener('input',()=>{
        model[section] ??= {};model[section][key]=input.value;
        if (section==='basic' && key==='fullName') model.name=input.value;
      });
      existing.append(input);row.append(existing);
      if (editable) {
        const proposed=el('div','importFieldCell');
        proposed.append(el('span','importFieldName','Proposed '+label));
        const value=proposal?.[section] && Object.hasOwn(proposal[section],key) ? proposal[section][key] : null;
        const reader=el('textarea','importProposedInput');reader.readOnly=true;reader.rows=3;
        if (value===null){reader.placeholder='No proposed change';reader.value='';}
        else {reader.value=value;reader.dataset.proposed='true';}
        const copy=el('button','quiet importCopy','Copy proposed');copy.type='button';copy.disabled=value===null;
        copy.onclick=async()=>{
          reader.focus();reader.select();
          try{await navigator.clipboard.writeText(value);toast('Copied '+label+' to clipboard.');}
          catch{toast('Select the proposed text and use Ctrl+C to copy.');}
        };
        proposed.append(reader,copy);row.append(proposed);
      }
      content.append(row);
    }
    group.append(content);host.append(group);
  }
}
async function openImportCompare(character) {
  if (!pendingImport || !state.characters.some(c=>c.id===character.id)) return;
  try {
    if (!(await flush()))return;
    const disk=await readJSON(character._handle);
    if (disk.id!==character.id) throw new Error('Character file ID differs from the loaded profile.');
    const draft=importDraftFromCharacter(character);
    pendingImport.mode='compare';pendingImport.targetId=character.id;
    pendingImport.baseline=JSON.stringify(disk);pendingImport.draft=draft;
    $('importCompareTitle').textContent='Compare: '+character.name;
    const idWarning = pendingImport.parsed.id && pendingImport.parsed.id!==character.id ? ' IDs differ; matched by name. Verify the character before saving. ' :
      pendingImport.parsed.id === character.id && importLookupName(pendingImport.parsed.name)!==importLookupName(character.name) ? ' Names differ; matched by ID. Verify the character before saving. ' : '';
    $('importCompareHint').textContent='Left: make your edits. Right: reference or copy what you want. Nothing changes on USB until Save. '+idWarning+pendingImport.parsed.warning;
    const host=$('importComparisonFields');host.replaceChildren();addImportFieldGrid(host,draft,pendingImport.parsed.fields,true);
    $('importCompareStatus').textContent='Review first. Nothing has been saved.';
    $('importCompareDialog').showModal();
  }catch(error){toast('Cannot review imported profile: '+error.message,true);}
}
function openImportedNewEditor() {
  if (!pendingImport) return;
  pendingImport.mode='new';
  const parsed=pendingImport.parsed,draft=blankCharacter(parsed.name);
  for (const [section,,keys] of IMPORT_FIELDS) for(const [key] of keys) {
    if (Object.hasOwn(parsed.fields[section]||{},key)) draft[section][key]=parsed.fields[section][key];
  }
  // New imports always receive a new ID; relationship UUIDs from other books
  // cannot be trusted. Editor keeps the profile in memory until Save.
  pendingImport.draft=draft;
  $('importNewTitle').textContent='New Character: '+parsed.name;
  const host=$('importNewFields');host.replaceChildren();addImportFieldGrid(host,draft,null,false);
  $('importNewStatus').textContent='Nothing has been written to the USB yet. '+parsed.warning;
  $('importNewDialog').showModal();
}
function importContextIsCurrent() {
  return pendingImport && state.writer?.id===pendingImport.writerId && state.novel?.id===pendingImport.novelId;
}
async function saveImportedExisting() {
  if (!importContextIsCurrent() || pendingImport.mode!=='compare') return;
  const button=$('importCompareSave');button.disabled=true;
  try {
    if (!(await flush())) throw Error('Unsaved changes elsewhere prevented the import.');
    const target=state.characters.find(c=>c.id===pendingImport.targetId);
    if (!target)throw Error('Target character no longer exists.');
    const disk=await readJSON(target._handle);
    if(JSON.stringify(disk)!==pendingImport.baseline) {
      throw Error('This character changed on USB since the comparison opened. Cancel and import again; nothing was overwritten.');
    }
    const draft=pendingImport.draft;
    const newName=cleanName(draft.basic?.fullName || draft.name);
    if(!newName)throw Error('Full name cannot be empty.');
    if(state.characters.some(c=>c.id!==target.id && importLookupName(c.name)===importLookupName(newName)))throw Error('Another character already has that name.');
    const updated=structuredClone(disk);
    for (const [section,,keys] of IMPORT_FIELDS) {
      updated[section] ??= {};
      for (const [key] of keys) updated[section][key]=draft[section][key]??'';
    }
    // Preserve the original link UUIDs, picture, timestamps, and unknown fields.
    updated.name=newName;
    const changed = updated.name!==disk.name || IMPORT_FIELDS.some(([section,,keys]) =>
      keys.some(([key]) => String(updated[section]?.[key] ?? '') !== String(disk[section]?.[key] ?? '')));
    if (!changed) { $('importCompareDialog').close();clearPendingImport();toast('No changes needed.');return; }
    updated.updatedAt=dateNow();
    await saveRevisionBeforeChange(target,true);
    await writeHandle(target._handle,JSON.stringify(updated,null,2)+'\n');
    const handle=target._handle,filename=target._filename;
    for (const key of Object.keys(target))if(!key.startsWith('_'))delete target[key];
    Object.assign(target,updated,{_handle:handle,_filename:filename});
    state.characters.sort((a,b)=>a.name.localeCompare(b.name));
    const importUndoScope=[state.manifest?.createdAt||state.root?.name||'library',state.writer.id,state.novel.id,'editor',target.id].join('/');
    clearUndo(importUndoScope); // No stale pre-import Undo may overwrite a reviewed change.
    if (state.active===target){state.savedRevision=state.revision;renderEditor();}
    else {renderCharacterList();if(!$('novelView').classList.contains('hidden'))await showCharacters();}
    $('importCompareDialog').close();clearPendingImport();status('Saved to folder');toast('Reviewed character changes saved to USB.');
  }catch(error){$('importCompareStatus').textContent='NOT SAVED: '+error.message;toast(error.message,true);}
  finally{button.disabled=false;}
}
async function saveImportedNew() {
  if (!importContextIsCurrent() || pendingImport.mode!=='new')return;
  const button=$('importNewSave');button.disabled=true;
  try {
    if (!(await flush()))throw Error('Unsaved edits elsewhere prevented saving.');
    const draft=pendingImport.draft;
    const name=cleanName(draft.basic?.fullName || draft.name);
    if(!name)throw Error('Enter a character name first.');
    if(state.characters.some(c=>importLookupName(c.name)===importLookupName(name)))throw Error('A character with that name already exists. Cancel and compare with the existing profile instead.');
    const fileName=folderSafe(name)+'--'+draft.id.slice(0,8)+'.json';
    // A collision is exceptional, but never overwrite a pre-existing file.
    try { await state.charsDir.getFileHandle(fileName);throw Error('The filename already exists. No files were overwritten.'); }
    catch(err){if(err.name!=='NotFoundError')throw err;}
    draft.name=name;draft.createdAt=dateNow();draft.updatedAt=draft.createdAt;
    const handle=await putJSON(state.charsDir,fileName,draft);
    draft._handle=handle;draft._filename=fileName;
    state.characters.push(draft);state.characters.sort((a,b)=>a.name.localeCompare(b.name));
    $('importNewDialog').close();clearPendingImport();await chooseCharacter(draft.id);
    status('Saved to folder');toast('New character created from reviewed import.');
  }catch(error){$('importNewStatus').textContent='NOT SAVED: '+error.message;toast('Could not save imported character: '+error.message,true);}
  finally{button.disabled=false;}
}
function initImportTools(){
  $('importCharacterNovelBtn').onclick=()=>void openImportPicker();
  $('importCharacterProfileBtn').onclick=()=>void openImportPicker();
  $('characterImportFile').addEventListener('change',e=>void importCharacterFile(e));
  $('importMatchCancel').onclick=()=>{$('importMatchDialog').close();clearPendingImport();};
  $('importMatchCreate').onclick=()=>{$('importMatchDialog').close();openImportedNewEditor();};
  $('importCompareClose').onclick=$('importCompareCancel').onclick=()=>{$('importCompareDialog').close();clearPendingImport();};
  $('importCompareCreateDifferent').onclick=()=>{$('importCompareDialog').close();openImportedNewEditor();};
  $('importCompareSave').onclick=()=>void saveImportedExisting();
  $('importNewClose').onclick=$('importNewCancel').onclick=()=>{$('importNewDialog').close();clearPendingImport();};
  $('importNewSave').onclick=()=>void saveImportedNew();
  for (const id of ['importMatchDialog','importCompareDialog','importNewDialog']) {
    $(id).addEventListener('close',()=>{
      // Escape closes without applying changes. Explicitly clear staged state
      // unless a different import modal was opened by the transition.
      if (!['importMatchDialog','importCompareDialog','importNewDialog'].some(other=>$(other).open)) clearPendingImport();
    });
  }
}

function init() {
  initImportTools();
  $('undoBtn').onclick=()=>void undoLast();updateUndoButton();
  $('refreshViewBtn').onclick=()=>void refreshCurrentView();
  $('globalSearchBtn').onclick=()=>void showLibrarySearch();
  $('searchShelfBtn').onclick=()=>void showBookshelf();
  $('runSearchBtn').onclick=()=>void runLibrarySearch();
  $('globalSearchInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();void runLibrarySearch();}});
  $('addTimelineEventBtn').onclick=()=>openTimelineEventDialog();
  $('timelineEventForm').addEventListener('submit',e=>void saveTimelineEvent(e));
  $('cancelEventBtn').onclick=()=>$('timelineEventDialog').close();
  $('closeRevisionsBtn').onclick=()=>$('revisionHistoryDialog').close();
  $('closeRevisionCompareBtn').onclick=()=>$('revisionCompareDialog').close();
  $('compareRevisionLeft').onchange=()=>void renderRevisionComparison();
  $('compareRevisionRight').onchange=()=>void renderRevisionComparison();
  $('brandHomeBtn').onclick=()=>{if(state.writer)void showBookshelf();else if(state.root){setStage('writer');} };
  $('gallerySort').onchange=()=>{if(state.novel)void showCharacters();};
  $('revisionHistoryBtn').onclick=()=>void showRevisionHistory();
  $('timelineAllMode').onclick=()=>{state.timelineFilter='all';renderTimeline();};
  $('timelineCharacterMode').onclick=()=>{state.timelineFilter=state.characters[0]?.id||'all';renderTimeline();};
  $('timelineCharacterFilter').onchange=e=>{state.timelineFilter=e.target.value;renderTimeline();};
  $('novelTimelineBtn').onclick=()=>void showTimeline();
  $('treeTimelineBtn').onclick=()=>void showTimeline();
  $('editorTimelineBtn').onclick=()=>void showTimeline();
  $('profileTimelineBtn').onclick=()=>void showTimeline();
  $('timelineShelfBtn').onclick=()=>void showBookshelf();
  $('timelineCharsBtn').onclick=()=>void showCharacters();
  $('timelineTreeBtn').onclick=()=>void showTree();
  $('coverInput').onchange=e=>void uploadBookCover(e);
  $('removeCoverBtn').onclick=()=>void removeBookCover();
  $('exportTreePngBtn').onclick=()=>void exportTreePNG();
  $('exportTreePdfBtn').onclick=()=>void exportTreePDF();
  $('selectFolderBtn').onclick = selectFolder;
  $('reselectFolderBtn').onclick = selectFolder;
  $('changeFolderBtn').onclick = selectFolder;
  $('newWriterBtn').onclick = createWriter;
  $('storageStatusBtn').onclick=()=>{renderStorageStatus();renderReminderSettings();$('storageStatusDialog').showModal();};
  $('closeStorageStatusBtn').onclick=()=>$('storageStatusDialog').close();
  $('backupReminderDays').onchange=event=>{setBackupReminderDays(Number(event.target.value));renderReminderSettings();};
  $('saveRecoveryElsewhereBtn').onclick=()=>void emergencySaveElsewhere();
  $('closeRecoveryDialogBtn').onclick=()=>$('recoveryDialog').close();
  $('downloadRecoveryReportBtn').onclick=downloadRecoveryReport;
  $('openRecoveredLibraryBtn').onclick=()=>void openRecoveredLibrary();
  const switchWriter = async () => {
    if (!(await flush())) return;
    state.writer = null; state.writerDir = null; state.novels = []; clearNovelState();
    renderWriterCards(); setStage('writer'); status('Choose writer');
  };
  $('switchWriterBtn').onclick = switchWriter;
  $('topSwitchWriterBtn').onclick = switchWriter;
  $('newNovelBtn').onclick = createNovel;
  $('bookshelfNewNovelBtn').onclick = createNovel;
  $('bookshelfBtn').onclick = () => void showBookshelf();
  $('novelCharactersBtn').onclick = () => void showCharacters();
  $('novelBackToShelfBtn').onclick = () => void showBookshelf();
  $('novelViewNewCharacterBtn').onclick = createCharacter;
  $('novelTreeBtn').onclick = () => void showTree();
  $('treeShelfBtn').onclick = () => void showBookshelf();
  $('treeCharactersBtn').onclick = () => void showCharacters();
  $('treeAutoLayoutBtn').onclick = () => void resetTreeLayout();
  $('treeConnectBtn').onclick = () => void addTreeConnection();
  $('treeFrom').addEventListener('change',()=>{if(state.novel && !$('treeView').classList.contains('hidden'))renderTree();});
  $('editorTreeBtn').onclick = () => void showTree();
  $('profileTreeBtn').onclick = () => void showTree();
  $('novelViewDeleteBookBtn').onclick = () => { if (state.novel) void deleteBook(state.novel.id); };
  $('profileShelfBtn').onclick = () => void showBookshelf();
  $('profileNovelBtn').onclick = () => void showCharacters();
  $('novelSelect').onchange = event => {
    if (event.target.value) void chooseNovel(event.target.value);
    else void showBookshelf();
  };
  $('newCharacterBtn').onclick = createCharacter;
  $('searchInput').oninput = renderCharacterList;
  $('portraitInput').onchange = event => void uploadPortrait(event);
  $('removePortraitBtn').onclick = removePortrait;
  $('deleteCharacterBtn').onclick = deleteCharacter;
  $('retrySaveBtn').onclick = () => void refreshCurrentView();
  $('downloadUnsavedBtn').onclick = downloadUnsavedProfile;
  $('backupBtn').onclick = ()=>$('backupDialog').showModal();
  $('closeBackupBtn').onclick=()=>$('backupDialog').close();
  $('exportWriterZipBtn').onclick=()=>void exportWriterZip();
  $('restoreWriterZipBtn').onclick=()=>{$('backupDialog').close();$('writerBackupFileInput').click();};
  $('writerBackupFileInput').onchange=e=>void beginRestorePreview(e);
  $('cancelRestoreBtn').onclick=()=>{pendingWriterRestore=null;$('restorePreviewDialog').close();};
  $('confirmRestoreBtn').onclick=()=>void confirmWriterRestore();
  $('copyLibraryFolderBtn').onclick=()=>void backupLibrary();
  $('editorBackCharactersBtn').onclick = () => void showCharacters();
  $('editorBackBookshelfBtn').onclick = () => void showBookshelf();
  for (const button of document.querySelectorAll('[data-jump]')) {
    button.addEventListener('click', () => {
      const section = $('section-' + button.dataset.jump);
      if (!section) return;
      section.open = true;
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  $('exportPdfCharacterBtn').onclick = () => void exportPdf('character');
  $('exportDocxCharacterBtn').onclick = () => void exportDocx('character');
  $('exportPdfNovelBtn').onclick = () => void exportPdf('novel');
  $('exportDocxNovelBtn').onclick = () => void exportDocx('novel');
  window.addEventListener('beforeunload', event => {
    if (memoryRecovery.pending.size || memoryRecovery.lastFailure || hasUnsaved() || !!state.saving || treeUnsaved() || !!state.treeSaving || !!pendingImport || !!pendingWriterRestore) { event.preventDefault(); event.returnValue = ''; }
  });
  setStage('folder');
}
document.addEventListener('DOMContentLoaded', init);
