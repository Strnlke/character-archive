/* Character Bookshelf 4.1 — writer-local linked novel series.
 * No existing book/character/timeline file is migrated to enable series.
 * All persistent operations use the existing verified File System Access layer.
 */
const SERIES_FILENAME='character-bookshelf-series.json';
async function loadSeries(dir){
  try{
    const data=await readJSON(await dir.getFileHandle(SERIES_FILENAME));
    if(data.type!=='character-bookshelf-series'||!Array.isArray(data.series))throw Error('Unexpected series file format.');
    const known=new Set(state.novels.map(n=>n.id)),used=new Set();
    return data.series.filter(s=>s && typeof s.id==='string' && typeof s.name==='string' && Array.isArray(s.bookIds))
      .map(s=>({id:s.id,name:s.name,bookIds:[...new Set(s.bookIds.filter(id=>known.has(id)))].filter(id=>{
        if(used.has(id))return false;used.add(id);return true;
      })}));
  }catch(e){if(e.name==='NotFoundError')return [];throw Error('Could not read series metadata safely: '+e.message);}
}
let seriesWriteBusy=false;
async function persistSeries(next){
  if(seriesWriteBusy)throw Error('A series change is still being saved. Try again when it finishes.');
  seriesWriteBusy=true;
  try{
  if(!state.writerDir)throw Error('Select a writer first.');
  const clean=next.map(s=>({id:s.id,name:s.name,bookIds:[...s.bookIds]}));
  await putJSON(state.writerDir,SERIES_FILENAME,{type:'character-bookshelf-series',version:1,series:clean});
  state.series=clean;
  if(!state.series.some(s=>s.id===state.activeSeries))state.activeSeries=state.series[0]?.id||null;
  status('Saved to folder');
  }finally{seriesWriteBusy=false;}
}
function seriesForBook(id){return state.series.find(s=>s.bookIds.includes(id))||null;}
function renderShelfSeries(){
  // Keep one ordinary bookshelf. Series members stay adjacent in series order,
  // with each row still using the same five-book shelf capacity as before.
  const bookGroups=[],seen=new Set();
  for(const novel of state.novels){
    if(seen.has(novel.id))continue;
    const series=seriesForBook(novel.id);
    const books=series
      ? series.bookIds.map(id=>state.novels.find(book=>book.id===id)).filter(Boolean)
      : [novel];
    for(const book of books)seen.add(book.id);
    if(books.length)bookGroups.push(books);
  }
  const shelves=[];let row=[];
  const endRow=()=>{if(row.length){shelves.push({books:row});row=[];}};
  for(const group of bookGroups){
    // Do not split a small series merely because only one space remains.
    if(group.length<=5 && row.length && group.length>5-row.length)endRow();
    for(const book of group){
      if(row.length===5)endRow();
      row.push(book);
    }
  }
  endRow();
  return shelves;
}
async function showSeries(){
  if(!(await flush())){toast('Save changes before opening Series.',true);return;}
  if(!state.writer)return;
  hideMainViews();cleanGalleryUrls();cleanCoverUrls();
  $('seriesView').classList.remove('hidden');
  setActiveSidebarNavigation('series');setWorkspaceView('series');
  renderSeries();
}
function renderSeries(){
  const host=$('seriesList');host.replaceChildren();
  for(const s of state.series){
    const b=el('button','seriesTab'+(s.id===state.activeSeries?' selected':''),s.name);
    b.type='button';b.onclick=()=>{state.activeSeries=s.id;renderSeries();};host.append(b);
  }
  if(!state.series.length)host.append(el('p','muted','No series yet. Create one to link your existing novels.'));
  const series=state.series.find(s=>s.id===state.activeSeries)||state.series[0];
  if(series)state.activeSeries=series.id;
  const body=$('seriesDetails');body.replaceChildren();
  if(!series){body.append(el('p','muted','Create a series, then add books in their reading or story order. Each book keeps its own files and timeline.'));return;}
  const headline=el('div','seriesHeader');
  const info=el('div');info.append(el('h2','',series.name),el('p','muted',series.bookIds.length+' book'+(series.bookIds.length===1?'':'s')+' · Character profiles remain independent.'));
  const actions=el('div','seriesHeaderActions');
  const rename=el('button','quiet','Rename');rename.type='button';rename.onclick=()=>void renameSeries(series.id);
  const remove=el('button','dangerOutline','Delete series links');remove.type='button';remove.onclick=()=>void deleteSeriesLinks(series.id);
  actions.append(rename,remove);headline.append(info,actions);body.append(headline);

  const row=el('div','seriesBooks');
  for(const [i,id] of series.bookIds.entries()){
    const book=state.novels.find(n=>n.id===id);if(!book)continue;
    const tile=el('div','seriesBookCard');const cover=el('div','seriesMiniCover');
    cover.append(el('span','',book.name));
    if(book.coverFile)void showBookCover(book,cover);
    const open=el('button','seriesOpen',book.name);open.type='button';open.onclick=()=>void chooseNovel(book.id);
    const ord=el('span','seriesOrder','Book '+(i+1));
    const bar=el('div','seriesBookActions');
    for(const [label,delta] of [['←',-1],['→',1]]){
      const b=el('button','quiet',label);b.type='button';b.title=delta<0?'Move earlier':'Move later';
      b.disabled=(delta<0&&i===0)||(delta>0&&i===series.bookIds.length-1);
      b.onclick=()=>void moveBookWithinSeries(series.id,id,delta);bar.append(b);
    }
    const unlink=el('button','textButton','Unlink');unlink.type='button';unlink.onclick=()=>void unlinkSeriesBook(series.id,id);bar.append(unlink);
    tile.append(cover,ord,open,bar);row.append(tile);
  }
  if(!series.bookIds.length)row.append(el('p','muted','This series is empty. Add a book below.'));
  body.append(row);
  const available=state.novels.filter(n=>!seriesForBook(n.id));
  const linkForm=el('div','seriesLinkBar');const addLabel=el('label','', 'Add an existing novel to this series');
  const addSelect=el('select');addSelect.id='seriesBookPicker';
  addSelect.add(new Option(available.length?'Choose an unlinked novel…':'No unlinked novels available',''));
  for(const novel of available)addSelect.add(new Option(novel.name,novel.id));
  const add=el('button','primary','Link book');add.type='button';add.disabled=!available.length;
  add.onclick=async()=>{if(!addSelect.value||seriesWriteBusy)return;add.disabled=true;await linkSeriesBook(series.id,addSelect.value);if(add.isConnected)add.disabled=false;};
  linkForm.append(addLabel,addSelect,add);body.append(linkForm);
  const tool=el('div','seriesTools');
  const charTitle=el('h2','', 'Copy a character between books');
  tool.append(charTitle,el('p','muted','Copies get their own profile and portrait. Relationships appear only after both characters have been copied. Edits to either book remain separate.'));
  const copyGrid=el('div','seriesCopyGrid');
  const from=el('select');from.id='seriesCopyFrom';from.setAttribute('aria-label','Source novel');
  const to=el('select');to.id='seriesCopyTo';to.setAttribute('aria-label','Destination novel');
  const char=el('select');char.id='seriesCopyCharacter';char.setAttribute('aria-label','Character to copy');
  const books=series.bookIds.map(id=>state.novels.find(n=>n.id===id)).filter(Boolean);
  for(const novel of books){from.add(new Option(novel.name,novel.id));to.add(new Option(novel.name,novel.id));}
  if(books.length>1)to.selectedIndex=1;
  const copy=el('button','primary','Copy character');copy.id='seriesCopyButton';copy.type='button';copy.disabled=books.length<2;
  from.onchange=()=>{if(to.value===from.value)to.value=books.find(n=>n.id!==from.value)?.id||from.value;void refreshSeriesCopyCharacterOptions(from.value,char);};
  to.onchange=()=>{copy.disabled=books.length<2||from.value===to.value;};
  copy.onclick=()=>void copySeriesCharacter(series.id,from.value,to.value,char.value);
  for(const [label,input] of [['From book',from],['Character',char],['To book',to]]){
    const wrapper=el('label','',label);wrapper.append(input);copyGrid.append(wrapper);
  }
  copyGrid.append(copy);tool.append(copyGrid);
  if(books.length<2)tool.append(el('p','muted','Link at least two novels before copying characters.'));
  body.append(tool);
  void refreshSeriesCopyCharacterOptions(from.value,char);
  const timeline=el('section','seriesTools');timeline.append(el('h2','','Combined series timeline'),el('p','muted','Events are read from the individual novel timelines, never duplicated. Undated or relative events stay separate. Open an event to add or change its date in the original novel.'));
  const events=el('div','seriesTimeline');events.id='seriesTimeline';timeline.append(events);body.append(timeline);
  void renderSeriesTimeline(series,events);
}
async function createSeries(){
  if(!state.writer)return;
  const name=await askName('Create series','Series name','Books in a series appear together on the bookshelf.');
  if(!name)return;
  if(state.series.some(s=>s.name.toLowerCase()===name.toLowerCase())){toast('That series already exists.',true);return;}
  try{const series={id:randomId(),name,bookIds:[]};await persistSeries([...state.series,series]);state.activeSeries=series.id;renderSeries();toast('Series created. Link an existing novel to begin.');}
  catch(e){toast('Could not create series: '+e.message,true);}
}
async function renameSeries(id){
  const prev=state.series.find(s=>s.id===id);if(!prev)return;
  const name=await askName('Rename series','New series name','This changes the group title, not any novel files.');if(!name)return;
  if(state.series.some(s=>s.id!==id&&s.name.toLowerCase()===name.toLowerCase())){toast('A series already has that name.',true);return;}
  try{await persistSeries(state.series.map(s=>s.id===id?{...s,name}:s));renderSeries();}
  catch(e){toast('Could not rename series: '+e.message,true);}
}
async function deleteSeriesLinks(id){
  const series=state.series.find(s=>s.id===id);if(!series||!confirm('Remove the series “'+series.name+'”? No novels or character files will be deleted.'))return;
  try{await persistSeries(state.series.filter(s=>s.id!==id));renderSeries();toast('Series links removed. Your novels were not deleted.');}
  catch(e){toast('Could not remove series: '+e.message,true);}
}
async function linkSeriesBook(id,bookId){
  const series=state.series.find(s=>s.id===id);
  if(!series||!state.novels.some(n=>n.id===bookId)||seriesForBook(bookId))return;
  try{await persistSeries(state.series.map(s=>s.id===id?{...s,bookIds:[...s.bookIds,bookId]}:s));renderSeries();toast('Book linked to the series.');}
  catch(e){toast('Could not link book: '+e.message,true);}
}
async function unlinkSeriesBook(id,bookId){
  try{await persistSeries(state.series.map(s=>s.id===id?{...s,bookIds:s.bookIds.filter(x=>x!==bookId)}:s));renderSeries();toast('Book unlinked. No files were removed.');}
  catch(e){toast('Could not unlink book: '+e.message,true);}
}
async function moveBookWithinSeries(id,bookId,by){
  const series=state.series.find(s=>s.id===id);if(!series)return;
  const ids=[...series.bookIds],at=ids.indexOf(bookId),target=at+by;
  if(at<0||target<0||target>=ids.length)return;
  [ids[at],ids[target]]=[ids[target],ids[at]];
  try{await persistSeries(state.series.map(s=>s.id===id?{...s,bookIds:ids}:s));renderSeries();}
  catch(e){toast('Could not reorder novels: '+e.message,true);}
}
async function listBookCharacters(bookId){
  const novel=state.novels.find(n=>n.id===bookId);if(!novel)throw Error('Novel unavailable.');
  const dir=await state.writerDir.getDirectoryHandle(novel.folder);
  const chars=await dir.getDirectoryHandle('characters',{create:false});
  const items=[];
  for await(const [filename,handle] of chars.entries()){
    if(handle.kind!=='file'||!filename.toLowerCase().endsWith('.json'))continue;
    const data=await readJSON(handle);
    if(!data.id||!data.name)throw Error('Invalid character in '+novel.name+'.');
    items.push({...data,_handle:handle,_filename:filename});
  }
  return items.sort((a,b)=>a.name.localeCompare(b.name));
}
let seriesCharacterRequest=0;
async function refreshSeriesCopyCharacterOptions(bookId,picker){
  const req=++seriesCharacterRequest;
  picker.replaceChildren(new Option('Loading…',''));
  if(!bookId){picker.replaceChildren(new Option('Choose a book…',''));return;}
  try{
    const chars=await listBookCharacters(bookId);
    if(req!==seriesCharacterRequest || !picker.isConnected)return;
    picker.replaceChildren(new Option(chars.length?'Choose a character…':'No characters in this book',''));
    for(const c of chars)picker.add(new Option(c.name,c.id));
  }catch(e){if(req===seriesCharacterRequest)picker.replaceChildren(new Option('Could not load characters',''));toast('Series characters: '+e.message,true);}
}
async function resolveSeriesRelationshipSeeds(destinationProfiles,destDir){
  const byOrigin=new Map(destinationProfiles.filter(p=>p.copyOrigin?.bookId&&p.copyOrigin?.characterId)
    .map(p=>[p.copyOrigin.bookId+':'+p.copyOrigin.characterId,p]));
  for(const profile of destinationProfiles){
    const pending=Array.isArray(profile.seriesPendingLinks)?profile.seriesPendingLinks:[];
    if(!pending.length)continue;
    const keep=[],toAdd=[];
    for(const seed of pending){
      const target=byOrigin.get(seed.bookId+':'+seed.characterId);
      if(!target||target.id===profile.id){keep.push(seed);continue;}
      if(!(profile.relationships?.links||[]).some(link=>link.id===target.id))
        toAdd.push({id:target.id,type:seed.type||'connected',notes:seed.notes||''});
    }
    if(keep.length===pending.length)continue;
    const updated={...diskProfile(profile),relationships:{...(profile.relationships||{}),links:[...(profile.relationships?.links||[]),...toAdd]},seriesPendingLinks:keep,updatedAt:dateNow()};
    // If write fails we keep the original pending seeds so recovery is safe.
    await putJSON(destDir,profile._filename,updated);
    profile.relationships=updated.relationships;profile.seriesPendingLinks=keep;profile.updatedAt=updated.updatedAt;
  }
}
async function copySeriesCharacter(seriesId,sourceId,destinationId,characterId){
  const series=state.series.find(s=>s.id===seriesId),source=state.novels.find(n=>n.id===sourceId),dest=state.novels.find(n=>n.id===destinationId);
  if(!series||sourceId===destinationId||!series.bookIds.includes(sourceId)||!series.bookIds.includes(destinationId)||!source||!dest||!characterId){toast('Select two different books and a character.',true);return;}
  if(!(await flush()))return;
  const button=$('seriesCopyButton');if(button)button.disabled=true;
  try{
    const originals=await listBookCharacters(sourceId),origin=originals.find(c=>c.id===characterId);
    const existing=await listBookCharacters(destinationId);
    if(!origin)throw Error('The selected character was not found.');
    if(existing.some(c=>c.copyOrigin?.bookId===sourceId&&c.copyOrigin?.characterId===origin.id)){
      toast('This exact character has already been copied to the destination book.',true);return;
    }
    if(existing.some(c=>c.name.toLocaleLowerCase()===origin.name.toLocaleLowerCase()) &&
      !confirm('“'+origin.name+'” already exists in '+dest.name+'. Copy as another independent profile anyway?'))return;
    const destDir=await state.writerDir.getDirectoryHandle(dest.folder);
    const characterDir=await destDir.getDirectoryHandle('characters',{create:true});
    const portraitDir=await destDir.getDirectoryHandle('portraits',{create:true});
    const sourceDir=await state.writerDir.getDirectoryHandle(source.folder);
    const sourcePortraits=await sourceDir.getDirectoryHandle('portraits',{create:true});
    const id=randomId(),now=dateNow();
    const copied=diskProfile(origin);copied.id=id;copied.createdAt=now;copied.updatedAt=now;
    copied.copyOrigin={bookId:sourceId,characterId:origin.id};
    const sourceLinks=Array.isArray(origin.relationships?.links)?origin.relationships.links:[];
    const validSourceIds=new Set(originals.map(c=>c.id));
    copied.seriesPendingLinks=sourceLinks.filter(l=>validSourceIds.has(l.id)).map(l=>({bookId:sourceId,characterId:l.id,type:l.type||'connected',notes:l.notes||''}));
    copied.relationships={...(origin.relationships||{}),links:[]};
    if(origin.portraitFile){
      const extension=origin.portraitFile.split('.').pop().toLowerCase();
      if(!['jpg','jpeg','png','webp'].includes(extension))throw Error('Portrait type is unsupported; no copy was made.');
      const photo=await(await sourcePortraits.getFileHandle(origin.portraitFile)).getFile();
      copied.portraitFile='portrait-'+id+'.'+extension;
      await putFile(portraitDir,copied.portraitFile,new Uint8Array(await photo.arrayBuffer()));
    }
    const filename=folderSafe(origin.name)+'--'+id.slice(0,8)+'.json';
    await putJSON(characterDir,filename,copied);
    const profiles=await listBookCharacters(destinationId);
    try{await resolveSeriesRelationshipSeeds(profiles,characterDir);}
    catch(e){toast('Character copied, but one or more pending tree links need a retry: '+e.message,true);return;}
    // Destinations are read freshly when opened; don't pollute the current novel.
    toast('Copied '+origin.name+' to '+dest.name+'. Both profiles are independent.');
  }catch(e){toast('Could not copy character: '+e.message,true);}
  finally{if(button && button.isConnected)button.disabled=sourceId===destinationId;}
}
// Years are never inferred from relative prose. Recognize only an explicit
// numeric year or clearly absolute ISO/English date with a four-digit year.
function seriesEventYear(event){
  if(Number.isInteger(event.year))return event.year;
  // A year explicitly entered as text is still a year; never infer one
  // from relative prose such as 'next summer' or 'three days later'.
  if(typeof event.year==='string' && /^-?\d{1,5}$/.test(event.year.trim()))return Number(event.year);
  const date=String(event.dateText||'').trim();
  if(/^-?\d{1,5}$/.test(date))return Number(date);
  let match=date.match(/^(\d{4})-(?:0?[1-9]|1[012])-(?:0?[1-9]|[12][0-9]|3[01])$/);
  if(match)return Number(match[1]);
  match=date.match(/^(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+(\d{4})$/i);
  return match?Number(match[1]):null;
}
function seriesEventDay(event){
  const value=String(event.dateText||'').trim();
  const isIso=/^\d{4}-\d{1,2}-\d{1,2}$/.test(value);
  const isEnglish=/^(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:,?\s+\d{4})?$/i.test(value);
  if(!isIso&&!isEnglish)return null;
  const date=new Date(value);return Number.isNaN(date.getTime())?null:date.getUTCMonth()*32+date.getUTCDate();
}
let seriesTimelineRequest=0;
async function renderSeriesTimeline(series,host){
  const request=++seriesTimelineRequest,writer=state.writer?.id;
  host.replaceChildren(el('p','muted','Reading book timelines…'));
  try{
    const events=[];
    for(const bookId of series.bookIds){
      const book=state.novels.find(n=>n.id===bookId);if(!book)continue;
      const dir=await state.writerDir.getDirectoryHandle(book.folder);
      const own=await loadTimelineEvents(dir);
      for(const event of own)events.push({event,book,year:seriesEventYear(event),day:seriesEventDay(event)});
    }
    if(request!==seriesTimelineRequest||writer!==state.writer?.id||!host.isConnected)return;
    host.replaceChildren();
    const dated=events.filter(x=>x.year!==null).sort((a,b)=>a.year-b.year||((a.day??-1)-(b.day??-1))||a.event.order-b.event.order);
    const undated=events.filter(x=>x.year===null);
    if(!events.length)host.append(el('p','muted','No events in the linked books yet. Add them in each book’s Timeline.'));
    const groups=new Map();for(const e of dated){if(!groups.has(e.year))groups.set(e.year,[]);groups.get(e.year).push(e);}
    for(const [year,items] of groups){
      const section=el('section','seriesEventGroup');section.append(el('h3','',String(year)));
      for(const entry of items)section.append(seriesEventButton(entry));host.append(section);
    }
    const section=el('section','seriesEventGroup seriesUndated');section.append(el('h3','','Undated / relative events'));
    if(!undated.length)section.append(el('p','muted','No undated events.'));
    for(const entry of undated)section.append(seriesEventButton(entry));host.append(section);
  }catch(e){if(request===seriesTimelineRequest)host.replaceChildren(el('p','errorText','Could not read the series timelines: '+e.message));}
}
function seriesEventButton(entry){
  const b=el('button','seriesEvent');b.type='button';
  b.append(el('strong','',entry.event.title));
  const meta=el('span','muted',entry.book.name+(entry.event.dateText?' · '+entry.event.dateText:''));b.append(meta);
  if(entry.event.notes)b.append(el('span','muted',entry.event.notes.slice(0,140)));
  b.onclick=async()=>{await chooseNovel(entry.book.id);if(state.novel?.id===entry.book.id){await showTimeline();openTimelineEventDialog(entry.event.id);}};
  return b;
}
