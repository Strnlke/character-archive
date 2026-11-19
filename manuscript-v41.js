/* v4.1 character manuscript navigation for TXT and DOCX. No author text
   is sent anywhere, and all highlights are temporary DOM-only decorations.
   Native embedded PDFs do not expose text positions to the web page; the
   interface explains that limit rather than inventing mention counts. */
const mentionState={paragraphs:[],index:new Map(),currentCharacter:null,currentMatches:[],currentPosition:-1,serial:0,activeMark:null};
function resetMentions(){
  mentionState.serial++;
  mentionState.paragraphs=[];mentionState.index.clear();mentionState.currentCharacter=null;
  mentionState.currentMatches=[];mentionState.currentPosition=-1;mentionState.activeMark=null;
  const list=$('manuscriptCharacterList'),hits=$('manuscriptMentionList');
  list?.replaceChildren();hits?.replaceChildren();
  if($('manuscriptMatchCounter'))$('manuscriptMatchCounter').textContent='Select a character';
}
function characterNameVariants(character){
  const raw=String(character.basic?.aliases||'');
  const list=[character.name,...raw.split(/[,;\n]+/)];
  return [...new Set(list.map(x=>String(x||'').trim()).filter(Boolean).map(x=>x.toLocaleLowerCase()))];
}
function manuscriptWholeWordMatches(text,word){
  const source=String(text||''),needle=String(word||'').toLocaleLowerCase(),hay=source.toLocaleLowerCase(),found=[];
  if(!needle)return found;
  let from=0;
  while(from<hay.length){
    const at=hay.indexOf(needle,from);if(at<0)break;
    const before=at>0?source[at-1]:'',after=source[at+needle.length]||'';
    if((!before||!/[\p{L}\p{N}]/u.test(before))&&(!after||!/[\p{L}\p{N}]/u.test(after)))found.push({start:at,end:at+needle.length});
    from=at+1;
  }
  return found;
}
function findMentionsFor(character){
  const cached=mentionState.index.get(character.id);if(cached)return cached;
  const names=characterNameVariants(character),matches=[];
  let chapter='Full manuscript';
  for(const [paragraph,item] of mentionState.paragraphs.entries()){
    const raw=item.text||'';
    if(looksLikeChapter(item))chapter=raw.trim().slice(0,140)||chapter;
    const locations=new Map();
    for(const name of names){
      for(const m of manuscriptWholeWordMatches(raw,name))locations.set(m.start+':'+m.end,{paragraph,start:m.start,end:m.end,chapter,excerpt:searchExcerpt(raw,m.start,m.end-m.start)});
    }
    matches.push(...locations.values());
  }
  matches.sort((a,b)=>a.paragraph-b.paragraph||a.start-b.start);
  mentionState.index.set(character.id,matches);return matches;
}
async function initializeMentionNavigation(paragraphs){
  resetMentions();mentionState.paragraphs=paragraphs;
  const serial=mentionState.serial;
  $('manuscriptMentionsIntro').textContent='Search existing character names and confirmed aliases. Click a name to explore mentions by chapter.';
  $('manuscriptMentionsPanel').classList.remove('hidden');
  $('manuscriptPrevMatch').disabled=true;$('manuscriptNextMatch').disabled=true;
  const list=$('manuscriptCharacterList');
  const rendered=[];
  for(const character of state.characters){
    const button=el('button','manuscriptCharacterButton');button.type='button';
    const label=el('span','',character.name),count=el('span','mentionCount','…');
    button.dataset.characterId=character.id;button.append(label,count);list.append(button);
    button.onclick=()=>showCharacterMentions(character.id);
    rendered.push({character,count});
  }
  // Yield between small batches so a large library doesn't lock the reader.
  for(const [i,item] of rendered.entries()){
    if(serial!==mentionState.serial || $('manuscriptView').classList.contains('hidden'))return;
    item.count.textContent=String(findMentionsFor(item.character).length);
    if(i%4===3)await new Promise(resolve=>setTimeout(resolve,0));
  }
}
function indicatePdfMentionLimit(){
  resetMentions();
  $('manuscriptMentionsPanel').classList.remove('hidden');
  $('manuscriptMentionsIntro').textContent='This PDF uses the browser’s built-in viewer. Precise name counts, contextual highlighting, and jump-to-match are available for TXT and DOCX, but not PDF in v4.1. Use your PDF viewer’s Find (Ctrl+F) or page navigation.';
  const list=$('manuscriptCharacterList');
  for(const character of state.characters){
    const item=el('div','manuscriptCharacterButton pdfUnavailable');
    item.append(el('span','',character.name),el('span','mentionCount','—'));list.append(item);
  }
  $('manuscriptMatchCounter').textContent='PDF text matching unavailable';
  $('manuscriptPrevMatch').disabled=true;$('manuscriptNextMatch').disabled=true;
}
function showCharacterMentions(id){
  const character=state.characters.find(c=>c.id===id);if(!character)return;
  mentionState.currentCharacter=id;mentionState.currentMatches=findMentionsFor(character);mentionState.currentPosition=-1;
  const matches=mentionState.currentMatches,host=$('manuscriptMentionList');host.replaceChildren();
  $('manuscriptCharacterList').querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.dataset.characterId===character.id));
  $('manuscriptMatchCounter').textContent=character.name+' · '+matches.length+' mention'+(matches.length===1?'':'s');
  $('manuscriptPrevMatch').disabled=!matches.length;$('manuscriptNextMatch').disabled=!matches.length;
  if(mentionState.activeMark){mentionState.activeMark.replaceWith(document.createTextNode(mentionState.activeMark.textContent));mentionState.activeMark=null;}
  if(!matches.length){host.append(el('p','muted','No whole-word matches in this manuscript. The character remains visible even with zero mentions.'));return;}
  let currentChapter='';
  for(const [i,m] of matches.slice(0,400).entries()){
    if(m.chapter!==currentChapter){host.append(el('h4','manuscriptMatchGroup',m.chapter));currentChapter=m.chapter;}
    const b=el('button','manuscriptMentionExcerpt',m.excerpt);b.type='button';b.dataset.mention=String(i);
    b.onclick=()=>jumpToManuscriptMention(i);host.append(b);
  }
  if(matches.length>400)host.append(el('p','muted','Showing 400 previews. Use Next / Previous to browse all matches.'));
}
function jumpToManuscriptMention(index){
  const matches=mentionState.currentMatches;if(!matches.length)return;
  const at=((index%matches.length)+matches.length)%matches.length;
  const match=matches[at];mentionState.currentPosition=at;
  const block=$('manuscriptText').querySelector('[data-paragraph-index="'+match.paragraph+'"]');
  if(!block)return;
  if(mentionState.activeMark){mentionState.activeMark.replaceWith(document.createTextNode(mentionState.activeMark.textContent));mentionState.activeMark=null;}
  // The previous mark may have fragmented the original text node. Assigning
  // textContent rebuilds the exact original paragraph without changing disk.
  const text=mentionState.paragraphs[match.paragraph].text||'';
  block.replaceChildren(document.createTextNode(text.slice(0,match.start)));
  const mark=el('mark','manuscriptActiveMark',text.slice(match.start,match.end));
  block.append(mark,document.createTextNode(text.slice(match.end)));
  mentionState.activeMark=mark;
  const host=$('manuscriptText');host.scrollTop+=mark.getBoundingClientRect().top-host.getBoundingClientRect().top-75;
  mark.setAttribute('tabindex','-1');mark.focus({preventScroll:true});
  $('manuscriptMatchCounter').textContent=(at+1)+' / '+matches.length+' mentions';
  $('manuscriptMentionList').querySelectorAll('button').forEach(b=>b.classList.toggle('selected',Number(b.dataset.mention)===at));
  rememberReadingPosition({scrollTop:host.scrollTop,chapter:manuscriptState.chapterIndex,fontSize:manuscriptState.textSize});
}
