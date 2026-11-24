/* Character Bookshelf v4.1.4 — exact v4.1.3 DOM integration. No file writes. */
(()=>{'use strict';
 function install(){
  const button=document.getElementById('importCharacterNovelBtn');
  const zone=document.getElementById('characterDropZone');
  const picker=document.getElementById('characterImportFile');
  if(!button||!zone||!picker)return;
  const menu=document.createElement('div');menu.className='cb-import-menu';menu.id='characterImportMenu';menu.hidden=true;menu.setAttribute('role','group');menu.setAttribute('aria-label','Import a character JSON file');
  const heading=document.createElement('strong');heading.textContent='Import character';
  const upload=document.createElement('button');upload.className='primary cb-upload';upload.type='button';upload.textContent='↑ Upload JSON file';
  const description=document.createElement('div');description.className='cb-description';description.textContent='The existing review and duplicate safeguards still apply.';
  zone.querySelector('span').textContent='Drop one .json file to review before saving';
  menu.append(heading,upload,zone,description);
  button.parentElement.append(menu);
  button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','characterImportMenu');
  const close=()=>{menu.hidden=true;button.setAttribute('aria-expanded','false')};
  const toggle=()=>{menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden))};
  // Base initImportTools has already attached the original handler; override only the novel button.
  button.onclick=toggle;
  upload.onclick=()=>{close();picker.value='';picker.click()};
  zone.addEventListener('drop',()=>setTimeout(close,0));
  document.addEventListener('pointerdown',ev=>{if(!menu.hidden&&!menu.contains(ev.target)&&!button.contains(ev.target))close()},true);
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!menu.hidden){ev.preventDefault();close();button.focus()}},true);
  // For desktop, remove the now-redundant topbar Storage Status control;
  // the footer button and the live save/recovery meter are preserved.
 }
 document.addEventListener('DOMContentLoaded',install);
})();
