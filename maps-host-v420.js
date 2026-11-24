/* World Maps -> existing Bookshelf writer (no second folder picker, no cloud account).
   The map editor is same-origin and receives an in-memory File System Access handle.
   This script reads legacy state but never rewrites legacy novel/series metadata. */
(function(){'use strict';
 const page=document.getElementById('worldMapsHostPage');
 const frame=document.getElementById('worldMapsHostFrame');
 const novelBtn=document.getElementById('novelWorldMapsBtn');
 let context=null;
 const getContext=()=>{
   if(!state.writerDir||!state.writer)throw Error('Open a writer profile first.');
   return {writerDir:state.writerDir,writerId:state.writer.id,writerName:state.writer.name,
     novels:state.novels.map(n=>({id:n.id,name:n.name,seriesId:state.series.find(s=>s.bookIds.includes(n.id))?.id||null})),
     series:state.series.map(s=>({id:s.id,name:s.name,bookIds:[...s.bookIds]})),
     context};
 };
 window.CBWorldMapsBridge={
   getContext,
   close:()=>attemptClose(),
   async registerPendingMap(map){
     // Unsaved map annotations are part of the emergency writer snapshot.
     const maps=await (await state.writerDir.getDirectoryHandle('world-maps')).getDirectoryHandle('maps');
     const base=await recoveryPath(maps);if(!base)return;
     const path=base+'/'+map.id+'.json';
     const payload=JSON.stringify(map,null,2)+'\n';
     memoryRecovery.pending.set(path,{bytes:await contentBytes(payload),reason:'Unsaved World Maps annotations'});
     renderStorageStatus();
   },
   async registerMapDeletion(dir,name){
     const path=await recoveryPath(dir);
     if(path)recoveryRemove(path+'/'+name);
     updateRecoveryMeter();renderStorageStatus();
   },
   async registerVerifiedMapFile(dir,name,content){
     // Preserve maps metadata and annotations in Bookshelf's existing RAM snapshot.
     const file=await dir.getFileHandle(name);const path=await recoveryPath(file);
     if(!path||isManuscriptReferencePath(path))return;
     const bytes=await contentBytes(content);
     recoveryStore(path,bytes,++memoryRecovery.writeSerial);
     memoryRecovery.pending.delete(path);
     updateRecoveryMeter();renderStorageStatus();
   }
 };
 const open=async(scope,id)=>{
   if(!state.writerDir){toast('Select a writer first.',true);return;}
   if(scope==='novel'&&!state.novels.some(n=>n.id===id)){toast('Open a novel to edit its maps.',true);return;}
   if(scope==='series'&&!state.series.some(s=>s.id===id)){toast('Select a series to edit its maps.',true);return;}
   if(!(await flush())){toast('Save your existing changes before opening World Maps.',true);return;}
   context={scope,id};page.hidden=false;document.body.classList.add('cb-maps-page-open');
   frame.src='world-maps.html?v=4.2.1&session='+Date.now();
 };
 const attemptClose=()=>{
   // iframe guard is synchronous: a failed write or unsaved edit blocks closing.
   const mayClose=frame.contentWindow?.CBWorldMapsSession?.canClose;
   if(mayClose&&mayClose()===false){toast('World Map changes are not safely saved. Use Emergency Recovery in the map editor.',true);return false;}
   page.hidden=true;document.body.classList.remove('cb-maps-page-open');frame.src='about:blank';return true;
 };
 // The editor provides its own Back button. Escape is intentionally not an exit: it may close menus or editor dialogs.
 window.CBWorldMapsPageClose=attemptClose;
 if(novelBtn)novelBtn.onclick=()=>void open('novel',state.novel?.id);
 window.CBWorldMapsHost={open};
})();
