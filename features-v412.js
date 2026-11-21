/* Character Bookshelf v4.1.2: additive usability tools.
   All notes are saved in standalone JSON files in the existing novel folder.
   Original manuscripts and preexisting character fields are never rewritten. */
const NOVEL_NOTES_FILE='novel-notes.json';
const ANNOTATIONS_FILE='manuscript-annotations.json';
const noteUI={novelId:null,notes:[],baseline:null,busy:false,annotations:[],annotationBaseline:null,annotationBusy:false,manuscriptId:null,paragraphs:[],lastSelection:null,editing:null};
function plainNote(value){return String(value??'').trim().slice(0,30000);}
async function readOptionalRecord(dir,file,type){
  try{
    const document=await readJSON(await dir.getFileHandle(file));
    if(!document || document.type!==type || document.version!==1 || !Array.isArray(document.notes))throw Error('Unknown notes format');
    return document;
  }catch(e){if(e.name==='NotFoundError')return {type,version:1,notes:[]};throw e;}
}
async function readNovelNotesForSearch(dir){const doc=await readOptionalRecord(dir,NOVEL_NOTES_FILE,'character-bookshelf-novel-notes');return doc.notes.filter(n=>n && typeof n.text==='string');}
async function openNovelNoteData(){
  if(!state.novelDir)throw Error('Open a novel before managing notes.');
  const currentId=state.novel.id;
  const document=await readOptionalRecord(state.novelDir,NOVEL_NOTES_FILE,'character-bookshelf-novel-notes');
  if(currentId!==state.novel?.id)return false;
  noteUI.novelId=currentId;noteUI.notes=document.notes.filter(n=>n && typeof n.id==='string' && typeof n.text==='string');
  noteUI.baseline=JSON.stringify(document);return true;
}
async function saveNovelNoteData(next){
  if(noteUI.busy)throw Error('A note is already being saved.');
  if(!state.novelDir||noteUI.novelId!==state.novel?.id)throw Error('The novel changed; no note was saved.');
  noteUI.busy=true;
  try{
    const current=await readOptionalRecord(state.novelDir,NOVEL_NOTES_FILE,'character-bookshelf-novel-notes');
    if(JSON.stringify(current)!==noteUI.baseline)throw Error('Notes changed outside this tab. Refresh the view before saving; existing files were not overwritten.');
    const proposed={type:'character-bookshelf-novel-notes',version:1,notes:next};
    await putJSON(state.novelDir,NOVEL_NOTES_FILE,proposed);
    noteUI.notes=next;noteUI.baseline=JSON.stringify(proposed);invalidateSearchIndex();renderNovelNotes();
    status('Saved to folder');
  }finally{noteUI.busy=false;}
}
async function showNovelNotes(){
  if(!(await flush()))return;
  if(!state.novelDir)return;
  hideMainViews();$('novelNotesView').classList.remove('hidden');setActiveSidebarNavigation('');setWorkspaceView('novel-notes');
  $('novelNotesTitle').textContent=state.novel.name+' · Notes';
  $('novelNotesList').replaceChildren(el('p','muted','Loading novel notes…'));
  try{if(await openNovelNoteData())renderNovelNotes();}
  catch(e){$('novelNotesList').replaceChildren(el('p','errorText','Could not read novel notes: '+e.message));}
}
function renderNovelNotes(){
  const host=$('novelNotesList');host.replaceChildren();
  if(!noteUI.notes.length)host.append(el('p','muted','No novel-wide notes yet. Add a note for anything that does not belong to a particular character or manuscript passage.'));
  for(const note of [...noteUI.notes].reverse()){
    const card=el('article','novelNoteCard');card.dataset.noteId=note.id;
    const info=el('div','novelNoteMeta','Last edited '+formatMoment(note.updatedAt||note.createdAt));
    const text=el('textarea');text.value=note.text;text.setAttribute('aria-label','Novel note');text.maxLength=30000;
    const actions=el('div','novelNoteActions');const save=el('button','primary','Save changes');save.type='button';save.disabled=true;
    text.addEventListener('input',()=>{save.disabled=text.value===note.text||!text.value.trim();});
    save.onclick=async()=>{if(!text.value.trim())return;save.disabled=true;try{await saveNovelNoteData(noteUI.notes.map(n=>n.id===note.id?{...n,text:plainNote(text.value),updatedAt:dateNow()}:n));toast('Novel note saved.');}catch(e){save.disabled=false;toast(e.message,true);}};
    const del=el('button','dangerOutline','Delete');del.type='button';del.onclick=async()=>{if(!confirm('Delete this novel note? This cannot be undone.'))return;try{await saveNovelNoteData(noteUI.notes.filter(n=>n.id!==note.id));toast('Novel note deleted.');}catch(e){toast(e.message,true);}};
    actions.append(save,del);card.append(info,text,actions);host.append(card);
  }
}
function focusNovelNote(id){const card=[...$('novelNotesList').children].find(x=>x.dataset.noteId===id);if(card){card.scrollIntoView({block:'center'});card.querySelector('textarea')?.focus({preventScroll:true});}}
async function createNovelNote(){
  if(!state.novel)return;
  if(noteUI.novelId!==state.novel.id)try{await openNovelNoteData();}catch(e){toast(e.message,true);return;}
  const host=$('novelNotesList');
  if(host.querySelector('[data-new-note-draft]')){host.querySelector('[data-new-note-draft] textarea')?.focus();return;}
  const draft=el('article','novelNoteCard');draft.dataset.newNoteDraft='true';
  const text=el('textarea');text.placeholder='Write a note for this novel…';text.maxLength=30000;text.setAttribute('aria-label','New novel note');
  const actions=el('div','novelNoteActions');const save=el('button','primary','Save note');save.type='button';save.disabled=true;
  text.addEventListener('input',()=>{save.disabled=!plainNote(text.value);});
  save.onclick=async()=>{const content=plainNote(text.value);if(!content)return;save.disabled=true;
    const note={id:randomId(),text:content,createdAt:dateNow(),updatedAt:dateNow()};
    try{await saveNovelNoteData([...noteUI.notes,note]);toast('Novel note saved.');}
    catch(e){save.disabled=false;toast(e.message,true);}
  };
  const cancel=el('button','quiet','Cancel');cancel.type='button';cancel.onclick=()=>draft.remove();
  actions.append(save,cancel);draft.append(el('div','novelNoteMeta','New note · not saved yet'),text,actions);host.prepend(draft);text.focus();
}
function renderCharacterTagEditor(host,character){
  const container=el('div','tagsEditor'),label=el('label','','Character tags (optional; separate with commas)');
  const input=el('input');input.type='text';input.placeholder='Major, supporting, location…';input.value=Array.isArray(character.tags)?character.tags.join(', '):'';
  input.setAttribute('aria-label','Character tags');
  const tip=el('div','tagHint','Use your own tags. Commas separate tags. They appear in the gallery filter.');
  const chips=el('div','characterTagChips');
  const parse=x=>[...new Set(x.split(',').map(t=>t.trim()).filter(Boolean).map(t=>t.slice(0,60)))].slice(0,30);
  const paint=list=>{chips.replaceChildren();for(const t of list)chips.append(el('span','',t));};paint(Array.isArray(character.tags)?character.tags:[]);
  const apply=()=>{const next=parse(input.value);if(JSON.stringify(next)===JSON.stringify(character.tags||[]))return;
    const oldTags=Array.isArray(character.tags)?[...character.tags]:[];
    rememberUndo('Edit character tags',async()=>{character.tags=oldTags;queueSave();renderEditor();return true;},null,pageUndoKey('editor'));
    character.tags=next;queueSave();paint(next);};
  input.addEventListener('change',apply);input.addEventListener('blur',apply);
  container.append(label,input,tip,chips);host.append(container);
}
function updateTagFilter(){
  const select=$('galleryTagFilter');if(!select || !state.novel)return;
  const selected=select.value;
  const tags=[...new Set(state.characters.flatMap(c=>Array.isArray(c.tags)?c.tags.filter(t=>typeof t==='string'):[]))].sort((a,b)=>a.localeCompare(b));
  select.replaceChildren(new Option('All characters',''));
  for(const tag of tags)select.add(new Option(tag,tag));
  select.value=tags.includes(selected)?selected:'';
  return select.value;
}
// Existing gallery function keeps its original sorting, card actions and portraits.
const _v412ShowCharacters=showCharacters;
showCharacters=async function(){const result=await _v412ShowCharacters();const tag=updateTagFilter();
  if(tag && !$('novelView').classList.contains('hidden')){
    for(const tile of $('characterGallery').querySelectorAll('.characterTile')){
      const item=state.characters.find(c=>c.id===tile.dataset.characterId);
      tile.classList.toggle('hidden',!item?.tags?.includes(tag));
    }
  }
  return result;
};
// Avoid running one unnecessary new storage operation on every character edit.
function installTitleEditor(){
  const edit=$('novelTitleEditBtn'),form=$('novelTitleEditForm'),input=$('novelTitleInput');
  const cancel=()=>{form.classList.add('hidden');edit.classList.remove('hidden');};
  edit.onclick=()=>{if(!state.novel)return;input.value=state.novel.name;edit.classList.add('hidden');form.classList.remove('hidden');input.focus();input.select();};
  $('novelTitleCancel').onclick=cancel;
  input.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();cancel();}});
  form.addEventListener('submit',async e=>{
    e.preventDefault();const novel=state.novel,name=input.value.trim();if(!novel||!name)return;
    if(name===novel.name){cancel();return;}
    if(name.length>160){toast('Keep titles under 161 characters.',true);return;}
    if(state.novels.some(n=>n.id!==novel.id&&n.name.toLocaleLowerCase()===name.toLocaleLowerCase())){toast('Another novel already has that title.',true);return;}
    if(!(await flush()))return;
    try{
      const onDisk=await readJSON(await state.novelDir.getFileHandle('novel.json'));
      if(onDisk.id!==novel.id || onDisk.name!==novel.name)throw Error('This novel has changed outside the app. Refresh before renaming.');
      const saved={...onDisk,name};await putJSON(state.novelDir,'novel.json',saved);
      novel.name=name;state.novels.find(n=>n.id===novel.id).name=name;
      invalidateSearchIndex();renderNovelSelect();$('novelViewTitle').textContent=name;
      cancel();toast('Novel title updated. The storage folder was not renamed.');
    }catch(error){toast('Could not rename book: '+error.message,true);}
  });
}
function updateRecoveryMeter(){
  const meter=$('recoveryMeter');if(!meter)return;
  meter.classList.toggle('hidden',!state.root);
  const m=(memoryRecovery.bytes/1048576).toFixed(2),cap=Math.round(RECOVERY_LIMIT/1048576);
  meter.textContent='Recovery '+m+' / '+cap+' MiB';
  meter.title=(memoryRecovery.complete?'Complete':'Partial or scanning')+' temporary RAM snapshot. Manuscript files excluded.';
}
function bindFileDrop(zoneId,inputId,validate,label){
  const zone=$(zoneId),input=$(inputId);if(!zone||!input)return;
  let nesting=0;
  zone.addEventListener('dragenter',e=>{if(!e.dataTransfer?.types?.includes('Files'))return;e.preventDefault();nesting++;zone.classList.add('is-dragging');});
  zone.addEventListener('dragover',e=>{if(!e.dataTransfer?.types?.includes('Files'))return;e.preventDefault();e.dataTransfer.dropEffect='copy';});
  zone.addEventListener('dragleave',e=>{e.preventDefault();nesting=Math.max(0,nesting-1);if(!nesting)zone.classList.remove('is-dragging');});
  zone.addEventListener('drop',async e=>{
    e.preventDefault();nesting=0;zone.classList.remove('is-dragging');
    const files=[...(e.dataTransfer?.files||[])];if(files.length!==1){toast('Drop one '+label+' file at a time.',true);return;}
    if(!validate(files[0])){toast('Unsupported file type for '+label+'.',true);return;}
    // The existing import event handlers own all validation, review and replacement protection.
    const fakeEvent={target:{files,value:''}};
    if(inputId==='manuscriptFileInput')await importManuscript(fakeEvent);
    else await importCharacterFile(fakeEvent);
  });
}

// Manuscript annotations are sidecars; they are not written into the imported document.
async function openAnnotationData(){
  if(!state.novelDir||!state.novel)throw Error('Open a novel first.');
  const id=state.novel.id;
  const data=await readOptionalRecord(state.novelDir,ANNOTATIONS_FILE,'character-bookshelf-annotations');
  if(id!==state.novel?.id)return false;
  noteUI.manuscriptId=id;noteUI.annotations=data.notes.filter(n=>n&&typeof n.id==='string'&&typeof n.text==='string');
  noteUI.annotationBaseline=JSON.stringify(data);return true;
}
async function saveAnnotationData(next){
  if(noteUI.annotationBusy)throw Error('Another annotation save is in progress.');
  if(!state.novelDir||noteUI.manuscriptId!==state.novel?.id)throw Error('Open the same novel before saving this note.');
  noteUI.annotationBusy=true;
  try{
    const disk=await readOptionalRecord(state.novelDir,ANNOTATIONS_FILE,'character-bookshelf-annotations');
    if(JSON.stringify(disk)!==noteUI.annotationBaseline)throw Error('Annotations changed outside this tab. Reload them before editing.');
    const proposed={type:'character-bookshelf-annotations',version:1,notes:next};
    await putJSON(state.novelDir,ANNOTATIONS_FILE,proposed);
    noteUI.annotations=next;noteUI.annotationBaseline=JSON.stringify(proposed);
    renderAnnotationList();status('Saved to folder');
  }finally{noteUI.annotationBusy=false;}
}
function currentChapterAt(paragraphIndex){
  let chapter='Full manuscript';
  for(let i=0;i<=paragraphIndex && i<noteUI.paragraphs.length;i++){
    if(looksLikeChapter(noteUI.paragraphs[i]))chapter=noteUI.paragraphs[i].text?.trim()||chapter;
  }
  return chapter;
}
function captureReadingSelection(){
  if(manuscriptState.format==='pdf')return null;
  const selection=window.getSelection();if(!selection||selection.isCollapsed||!selection.toString().trim())return null;
  const range=selection.getRangeAt(0),root=$('manuscriptText');
  const first=(range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement)?.closest('[data-paragraph-index]');
  const last=(range.endContainer.nodeType===1?range.endContainer:range.endContainer.parentElement)?.closest('[data-paragraph-index]');
  if(!first||first!==last||!root.contains(first))return null;
  const paragraph=Number(first.dataset.paragraphIndex),whole=first.textContent||'',selected=selection.toString().trim();
  // Only exact text in a single paragraph is supported for stable relocating.
  if(!selected||selected.length>1000)return null;
  const positions=[];for(let i=whole.indexOf(selected);i>=0;i=whole.indexOf(selected,i+1))positions.push(i);
  if(!positions.length)return null;
  let index=positions[0];
  if(positions.length>1){
    const prior=document.createRange();prior.selectNodeContents(first);prior.setEnd(range.startContainer,range.startOffset);
    const offset=prior.toString().length;index=positions.reduce((a,b)=>Math.abs(b-offset)<Math.abs(a-offset)?b:a,index);
  }
  return {selectedText:selected, prefix:whole.slice(Math.max(0,index-75),index),suffix:whole.slice(index+selected.length,index+selected.length+75),chapter:currentChapterAt(paragraph),paragraph,offset:index,manuscriptChecksum:state.novel.manuscriptChecksum||null};
}
function candidatesForPassage(note){
  const quote=note.anchor?.selectedText||'';if(!quote)return [];
  const candidates=[];
  for(let i=0;i<noteUI.paragraphs.length;i++){
    const line=noteUI.paragraphs[i].text||'';
    for(let at=line.indexOf(quote);at>=0;at=line.indexOf(quote,at+1)){
      const prefix=(note.anchor.prefix||'').slice(-24),suffix=(note.anchor.suffix||'').slice(0,24);
      const prefixHit=!!prefix&&line.slice(Math.max(0,at-prefix.length),at).endsWith(prefix);
      const suffixHit=!!suffix&&line.slice(at+quote.length,at+quote.length+suffix.length).startsWith(suffix);
      const chapterHit=currentChapterAt(i)===note.anchor.chapter;
      candidates.push({paragraph:i,offset:at,score:Number(prefixHit)+Number(suffixHit)+Number(chapterHit),preview:line.slice(Math.max(0,at-44),Math.min(line.length,at+quote.length+55))});
      if(candidates.length>200)return candidates;
    }
  }
  return candidates;
}
function resolveAnnotation(note){
  if(!state.novel?.manuscriptFile)return {status:'unlinked',candidates:[]};
  const checksum=state.novel.manuscriptChecksum||null,anchor=note.anchor||{};
  if(note.type==='chapter'){
    if(manuscriptState.format==='pdf')return {status:anchor.manuscriptChecksum===checksum?'matched':'review',candidates:[]};
    const candidates=noteUI.paragraphs.map((p,i)=>({p,i})).filter(x=>looksLikeChapter(x.p)&&x.p.text.trim()===anchor.chapter).map(x=>({paragraph:x.i,offset:0,score:3,preview:x.p.text}));
    if(anchor.chapter==='Full manuscript'&&!candidates.length)return {status:'matched',candidates:[{paragraph:0,offset:0,preview:'Full manuscript'}]};
    return {status:candidates.length===1?'matched':candidates.length?'review':'unlinked',candidates};
  }
  if(manuscriptState.format==='pdf')return {status:'unlinked',candidates:[]};
  const candidates=candidatesForPassage(note);
  if(!candidates.length)return {status:'unlinked',candidates:[]};
  if(candidates.length===1)return {status:'matched',candidates};
  const best=Math.max(...candidates.map(c=>c.score));const top=candidates.filter(c=>c.score===best);
  if(best>=2 && top.length===1)return {status:'matched',candidates:[top[0]]};
  // If the user has explicitly approved a particular instance in this exact
  // manuscript revision, prefer that over a later ambiguous search.
  if(anchor.confirmedChecksum===checksum){const selected=candidates.find(c=>c.paragraph===anchor.paragraph&&c.offset===anchor.offset);if(selected)return {status:'matched',candidates:[selected]};}
  return {status:'review',candidates:top};
}
function scrollToAnnotationCandidate(candidate){
  if(manuscriptState.format==='pdf'){
    if(Number.isFinite(candidate?.page)){$('manuscriptPdfPage').value=String(candidate.page);jumpPdfPage();}return;
  }
  const node=$('manuscriptText').querySelector('[data-paragraph-index="'+candidate.paragraph+'"]');if(!node)return;
  node.classList.add('manuscriptNoteTarget');node.scrollIntoView({block:'center',behavior:'smooth'});
  setTimeout(()=>node.classList.remove('manuscriptNoteTarget'),4500);
}
function renderAnnotationList(){
  const host=$('annotationList');if(!host)return;
  host.replaceChildren();
  if(!noteUI.annotations.length){host.append(el('p','muted','No notes yet. Passage notes are linked to selected text; chapter notes refer to a chapter or PDF page.'));return;}
  const stats={matched:0,review:0,unlinked:0};
  for(const note of noteUI.annotations){
    const match=resolveAnnotation(note);stats[match.status]++;
    const card=el('article','annotationCard '+(match.status==='review'?'hasReview':match.status==='unlinked'?'isUnlinked':''));
    const label=note.type==='passage'?'Passage':'Chapter / page';
    const stateLabel=match.status==='matched'?'Matched':match.status==='review'?'Needs review':'Unlinked';
    const head=el('div','annotationCardHead');head.append(el('strong','',label+' note'),el('span','',stateLabel));
    const text=el('p','annotationCardText',note.text),meta=el('div','novelNoteMeta','Updated '+formatMoment(note.updatedAt||note.createdAt));
    const quote=el('div','annotationQuote',note.type==='passage'?'“'+(note.anchor?.selectedText||'').slice(0,240)+'”':note.anchor?.chapter||('Page '+note.anchor?.page));
    const actions=el('div','annotationActions');
    if(match.status==='matched'){
      const jump=el('button','quiet','Go to location');jump.type='button';jump.onclick=()=>scrollToAnnotationCandidate(manuscriptState.format==='pdf'?{page:note.anchor?.page}:match.candidates[0]);actions.append(jump);
    }
    if(match.status==='review'&&match.candidates.length){
      const select=el('select');select.setAttribute('aria-label','Choose which matching passage');
      match.candidates.slice(0,30).forEach((c,i)=>select.add(new Option('Paragraph '+(c.paragraph+1)+' · '+c.preview.slice(0,65),String(i))));
      const confirmBtn=el('button','quiet','Confirm location');confirmBtn.type='button';confirmBtn.onclick=async()=>{
        const chosen=match.candidates[Number(select.value)];if(!chosen)return;
        const next=noteUI.annotations.map(n=>n.id===note.id?{...n,anchor:{...n.anchor,paragraph:chosen.paragraph,offset:chosen.offset,confirmedChecksum:state.novel.manuscriptChecksum},updatedAt:dateNow()}:n);
        try{await saveAnnotationData(next);toast('Annotation location confirmed.');}catch(e){toast(e.message,true);}
      };actions.append(select,confirmBtn);
    }
    if(match.status==='review'&&manuscriptState.format==='pdf'){
      const confirmBtn=el('button','quiet','Confirm page');confirmBtn.type='button';confirmBtn.onclick=async()=>{
        const page=Number(prompt('Page number in this manuscript revision:',note.anchor?.page||1));if(!Number.isInteger(page)||page<1)return;
        try{await saveAnnotationData(noteUI.annotations.map(n=>n.id===note.id?{...n,anchor:{...n.anchor,page,manuscriptChecksum:state.novel.manuscriptChecksum},updatedAt:dateNow()}:n));}catch(e){toast(e.message,true);}
      };actions.append(confirmBtn);
    }
    if(match.status!=='matched'&&manuscriptState.format!=='pdf'){
      const relink=el('button','quiet','Reattach selection');relink.type='button';relink.title='Select a passage in the manuscript first';relink.onclick=async()=>{
        const nextAnchor=noteUI.lastSelection||captureReadingSelection();if(!nextAnchor){toast('Select text in a single manuscript paragraph first.',true);return;}
        try{await saveAnnotationData(noteUI.annotations.map(n=>n.id===note.id?{...n,type:'passage',anchor:nextAnchor,updatedAt:dateNow()}:n));noteUI.lastSelection=null;}catch(e){toast(e.message,true);}
      };actions.append(relink);
    }
    const edit=el('button','quiet','Edit');edit.type='button';edit.onclick=()=>openAnnotationEditor(note.type,note.anchor,note);
    const del=el('button','dangerOutline','Delete');del.type='button';del.onclick=async()=>{
      if(!confirm('Permanently delete this manuscript note?'))return;
      try{await saveAnnotationData(noteUI.annotations.filter(n=>n.id!==note.id));}catch(e){toast(e.message,true);}
    };
    actions.append(edit,del);card.append(head,quote,text,meta,actions);host.append(card);
  }
  $('annotationHint').textContent=`${stats.matched} matched · ${stats.review} need review · ${stats.unlinked} unlinked. Notes are saved separately and preserved after manuscript replacements.`;
}
function openAnnotationEditor(type,anchor,original=null){
  noteUI.editing={type,anchor,original};
  $('annotationDialogTitle').textContent=original?'Edit manuscript note':type==='passage'?'New passage note':'New chapter / page note';
  $('annotationAnchorPreview').textContent=type==='passage'?'Selected: '+(anchor.selectedText||'').slice(0,300):anchor.chapter||('Page '+anchor.page);
  $('annotationTextInput').value=original?.text||'';
  $('annotationEditDialog').showModal();$('annotationTextInput').focus();
}
function addPassageAnnotation(){
  if(!state.novel?.manuscriptFile)return toast('Import a manuscript first.',true);
  if(manuscriptState.format==='pdf')return toast('Highlighted passage notes require DOCX or TXT. Use page notes for PDFs.',true);
  const anchor=noteUI.lastSelection||captureReadingSelection();
  if(!anchor)return toast('Highlight text within one paragraph of the manuscript first.',true);
  openAnnotationEditor('passage',anchor);noteUI.lastSelection=null;
}
function addChapterAnnotation(){
  if(!state.novel?.manuscriptFile)return toast('Import a manuscript first.',true);
  if(manuscriptState.format==='pdf'){
    const page=Number($('manuscriptPdfPage').value)||1;
    return openAnnotationEditor('chapter',{chapter:'Page '+page,page,manuscriptChecksum:state.novel.manuscriptChecksum});
  }
  const host=$('manuscriptText');let index=0;
  for(const item of host.querySelectorAll('[data-paragraph-index]')){
    if(item.getBoundingClientRect().top-host.getBoundingClientRect().top>70)break;
    index=Number(item.dataset.paragraphIndex)||0;
  }
  const chapter=currentChapterAt(index);
  openAnnotationEditor('chapter',{chapter,paragraph:index,manuscriptChecksum:state.novel.manuscriptChecksum});
}
function htmlEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function exportAnnotatedPdf(){
  if(!state.novel?.manuscriptFile)return toast('Import a manuscript before exporting annotations.',true);
  const hasFullText=manuscriptState.format!=='pdf'&&noteUI.paragraphs.length;
  const notesByParagraph=new Map(),loose=[];
  for(const note of noteUI.annotations){
    const match=resolveAnnotation(note);
    if(match.status==='matched'&&hasFullText){const i=match.candidates[0]?.paragraph??0;if(!notesByParagraph.has(i))notesByParagraph.set(i,[]);notesByParagraph.get(i).push(note);}
    else loose.push({note,status:match.status});
  }
  const noteHtml=n=>`<aside class="note"><strong>${htmlEscape(n.type==='chapter'?'Chapter note':'Passage note')}</strong><p>${htmlEscape(n.text)}</p></aside>`;
  const body=hasFullText?noteUI.paragraphs.map((p,i)=>{
    const content=(p.text||'').trim();
    return `<div class="line"><div class="text">${looksLikeChapter(p)?'<h2>'+htmlEscape(content)+'</h2>':content?'<p>'+htmlEscape(content)+'</p>':'<p>&nbsp;</p>'}</div><div class="margin">${(notesByParagraph.get(i)||[]).map(noteHtml).join('')}</div></div>`;
  }).join(''):'<p class="warning">The PDF is displayed through the browser’s native viewer. Its page contents cannot be included in this export; this is a notes-only PDF report. Export the original PDF separately.</p>';
  const appendix=loose.length?'<h2>Unlinked or review-needed notes</h2>'+loose.map(({note,status})=>`<div class="appendix"><strong>${htmlEscape(status.toUpperCase())}</strong> · ${htmlEscape(note.anchor?.chapter||note.anchor?.selectedText||'')}<p>${htmlEscape(note.text)}</p></div>`).join(''):'';
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>${htmlEscape(state.novel.name)} — Annotated manuscript</title><style>
    @page{size:letter;margin:0.65in}body{font:12px/1.6 Georgia,serif;color:#20252c}header{border-bottom:1px solid #9ca6b2;margin-bottom:15px}header h1{font-size:22px}.line{display:grid;grid-template-columns:minmax(0,2.2fr) minmax(0,1fr);gap:16px;break-inside:avoid}.line .text p{margin:3px 0 8px;white-space:pre-wrap}.line .text h2{font-size:15px;margin:17px 0 8px}.note{font:11px/1.45 system-ui,sans-serif;background:#eff3f8;padding:7px 10px;border-left:3px solid #789abb;margin:3px 0 7px;white-space:pre-wrap}.note p{margin:4px 0}.appendix{border-top:1px solid #ccc;padding:8px 0;break-inside:avoid}.warning{padding:20px;background:#fff6df}.controls{font:13px system-ui,sans-serif;padding:10px 0}@media print{.controls{display:none}}
    </style></head><body><div class="controls"><button onclick="window.print()">Print / Save as PDF</button> · Choose “Save as PDF” in your browser’s printer menu. No changes are made to the manuscript.</div><header><h1>${htmlEscape(state.novel.name)}</h1><p>${hasFullText?'Annotated reference copy':'PDF annotations report'} · ${htmlEscape(state.novel.manuscriptOriginalName||'Manuscript')}</p></header>${body}${appendix}</body></html>`;
  // Initiate from the user click; opening a new tab avoids modifying the editor.
  const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
  // A noopener window.open() may return null even when it succeeds in Chrome.
  // Open the controlled, fully HTML-escaped report first, then sever its opener.
  const popup=window.open(url,'_blank');
  if(!popup){toast('Allow pop-ups to open the printable annotated export.',true);URL.revokeObjectURL(url);return;}
  try{popup.opener=null;}catch{};
  setTimeout(()=>URL.revokeObjectURL(url),120000);
}
// Hook into the existing reader after it has finished loading; don't parse twice.
const _v412RenderManuscriptParagraphs=renderManuscriptParagraphs;
renderManuscriptParagraphs=function(paragraphs,restore=true){
  noteUI.paragraphs=paragraphs;noteUI.lastSelection=null;
  return _v412RenderManuscriptParagraphs(paragraphs,restore);
};
const _v412ShowManuscript=showManuscript;
showManuscript=async function(){
  noteUI.paragraphs=[];noteUI.lastSelection=null;
  const novelId=state.novel?.id;
  $('annotationList').replaceChildren(el('p','muted','Loading manuscript notes…'));
  await _v412ShowManuscript();
  if(novelId!==state.novel?.id||$('manuscriptView').classList.contains('hidden'))return;
  $('exportAnnotatedBtn').textContent=manuscriptState.format==='pdf'?'↓ Print PDF notes report':'↓ Export annotated PDF';
  try{if(await openAnnotationData())renderAnnotationList();}
  catch(e){$('annotationList').replaceChildren(el('p','errorText','Could not read annotations: '+e.message));}
};
function installV412(){
  installTitleEditor();
  $('novelNotesBtn').onclick=()=>void showNovelNotes();
  $('notesBackBtn').onclick=()=>void showCharacters();
  $('newNovelNoteBtn').onclick=()=>void createNovelNote();
  $('galleryTagFilter').onchange=()=>{if(state.novel)void showCharacters();};
  $('addPassageNote').onclick=addPassageAnnotation;
  $('addChapterNote').onclick=addChapterAnnotation;
  $('exportAnnotatedBtn').onclick=exportAnnotatedPdf;
  $('annotationCancel').onclick=()=>$('annotationEditDialog').close();
  $('annotationEditForm').addEventListener('submit',async e=>{
    e.preventDefault();const edit=noteUI.editing;if(!edit)return;
    const text=plainNote($('annotationTextInput').value);if(!text)return;
    const now=dateNow();const next=edit.original?noteUI.annotations.map(n=>n.id===edit.original.id?{...n,text,updatedAt:now}:n):[...noteUI.annotations,{id:randomId(),type:edit.type,text,anchor:edit.anchor,createdAt:now,updatedAt:now}];
    try{await saveAnnotationData(next);$('annotationEditDialog').close();toast('Manuscript note saved separately from the document.');}
    catch(error){toast(error.message,true);}
  });
  $('manuscriptText').addEventListener('mouseup',()=>{const anchor=captureReadingSelection();if(anchor)noteUI.lastSelection=anchor;});
  $('manuscriptText').addEventListener('keyup',()=>{const anchor=captureReadingSelection();if(anchor)noteUI.lastSelection=anchor;});
  bindFileDrop('manuscriptDropZone','manuscriptFileInput',f=>/\.(docx|pdf|txt)$/i.test(f.name),'manuscript');
  bindFileDrop('characterDropZone','characterImportFile',f=>/\.json$/i.test(f.name),'character JSON');
  updateRecoveryMeter();
}
// The base app initializes on DOMContentLoaded, so register after it.
document.addEventListener('DOMContentLoaded',installV412);
