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
  revision: 0, savedRevision: 0, portraitUrl: null, galleryUrls: [], epoch: 0
};

async function readJSON(handle) {
  const file = await handle.getFile();
  return JSON.parse(await file.text());
}
async function putFile(directory, filename, content) {
  const handle = await directory.getFileHandle(filename, { create: true });
  await writeHandle(handle, content);
  return handle;
}
async function writeHandle(handle, content) {
  const writer = await handle.createWritable();
  try { await writer.write(content); await writer.close(); }
  catch (error) { try { await writer.abort(); } catch {} throw error; }
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
async function flush() {
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
        await writeHandle(character._handle, JSON.stringify(snapshot, null, 2) + '\n');
        state.savedRevision = revision;
        character.updatedAt = now;
        if (state.active === character && epoch === state.epoch) {
          $('lastSavedLabel').textContent = 'Saved ' + new Date(now).toLocaleString();
        }
      } catch (error) {
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
function setStage(stage) {
  $('startup').classList.toggle('hidden', stage === 'workspace');
  $('folderStep').classList.toggle('hidden', stage !== 'folder');
  $('writerStep').classList.toggle('hidden', stage !== 'writer');
  $('workspace').classList.toggle('hidden', stage !== 'workspace');
  $('backupBtn').classList.toggle('hidden', !state.root);
  $('topSwitchWriterBtn').classList.toggle('hidden', stage !== 'workspace');
  $('changeFolderBtn').classList.toggle('hidden', !state.root);
}
function clearNovelState() {
  state.novel = null; state.novelDir = null; state.charsDir = null; state.portraitsDir = null;
  state.characters = []; state.active = null; state.revision = 0; state.savedRevision = 0;
  state.epoch++;
  cleanPortraitUrl(); cleanGalleryUrls();
}
function clearRootState() {
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
  if (hasUnsaved() || state.saving) {
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
    clearRootState();
    state.root = root;
    state.selectedLocation = selected;
    state.manifest = manifest;
    $('folderName').textContent = root.name + (selected === root ? ' (existing library)' : ' (inside ' + selected.name + ')');
    $('retrySaveBtn').classList.add('hidden');
    $('downloadUnsavedBtn').classList.add('hidden');
    status(existing ? 'Existing library opened' : 'Character Bookshelf folder created');
    renderWriterCards();
    setStage('writer');
    toast(existing ? 'Existing library opened: ' + root.name + '.' : 'Created the Character Bookshelf folder.');
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
    host.append(button);
  }
}
async function createWriter() {
  const name = await askName('Create writer profile', 'Writer name', 'For example, Aaron or Lindsay.');
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
  } catch (error) { toast('Could not create writer: ' + error.message, true); }
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
  for (const id of ['bookshelfView', 'novelView', 'emptyView', 'editor']) $(id).classList.add('hidden');
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
  cleanGalleryUrls();
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
  const host = $('characterGallery');
  cleanGalleryUrls(); host.replaceChildren();
  if (!state.characters.length) {
    const empty = el('div','noCharacters');
    empty.append(el('span','bigGlyph','♟'), el('h3','', 'No characters yet'), el('p','', 'Create a character to start this novel’s collection.'));
    host.append(empty);
  }
  const epoch = state.epoch;
  for (const character of state.characters) {
    const tile = el('div','characterTile');
    const button = el('button','characterCard'); button.type='button';
    const frame = el('span','galleryPortrait');
    frame.append(el('span','gallerySilhouette','♟'));
    const body = el('span','galleryBody');
    body.append(el('span','galleryName', character.name));
    const role = character.story?.role?.trim();
    if (role) body.append(el('span','galleryRole',role));
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
function makeField(label, value, update, long = false) {
  const container = el('div', 'field' + (long ? ' wide' : ''));
  const lab = el('label', '', label);
  const input = el(long ? 'textarea' : 'input');
  input.id = 'character-field-' + (++fieldSerial);
  lab.htmlFor = input.id;
  if (long) input.rows = 3;
  input.value = value ?? '';
  input.addEventListener('input', () => update(input.value));
  container.append(lab, input);
  return container;
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
  $('lastSavedLabel').textContent = character.updatedAt ? 'Last saved ' + new Date(character.updatedAt).toLocaleString() : '';
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
        grid.append(makeField(label, character[section.key][key] || '', value => {
          character[section.key][key] = value;
          if (section.key === 'basic' && key === 'fullName') {
            character.name = value || 'Unnamed';
            $('characterName').textContent = character.name;
            $('profileNavName').textContent = character.name;
            renderCharacterList();
          }
          queueSave();
        }, !!long));
      }
      body.append(grid);
    }
    if (section.key === 'relationships') renderRelationships(body, character);
    const notes = el('div','notes');
    notes.append(makeField(section.key === 'freeform' ? 'Notes' : 'Additional notes', character[section.key].notes || '', value => {
      character[section.key].notes = value;
      queueSave();
    }, true));
    body.append(notes); details.append(summary, body); host.append(details);
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
      const notes = el('textarea'); notes.placeholder = 'Notes from this character’s perspective…'; notes.value = own.notes || '';
      notes.addEventListener('input', () => { own.notes = notes.value; queueSave(); });
      row.append(notes);
      const remove = el('button','removeButton','Unlink'); remove.type = 'button';
      remove.onclick = () => { character.relationships.links = character.relationships.links.filter(x => x.id !== link.id); queueSave(); renderEditor(); };
      row.append(remove);
    } else {
      row.append(el('span','muted','Linked from '+target.name));
      const addOwn = el('button','quiet','Add my notes'); addOwn.type = 'button';
      addOwn.onclick = () => { character.relationships.links.push({ id: target.id, notes: '' }); queueSave(); renderEditor(); };
      row.append(addOwn);
    }
    host.append(row);
  }
  const picker = el('div','relationPicker'), select = el('select');
  select.append(new Option('Select character to link…',''));
  const linked = new Set(relatedCharacters(character).map(r => r.id));
  for (const c of state.characters.filter(c => c.id !== character.id && !linked.has(c.id))) select.add(new Option(c.name, c.id));
  const add = el('button','primary','Link character'); add.type = 'button'; add.disabled = select.options.length < 2;
  add.onclick = () => { if (!select.value) return; character.relationships.links.push({ id: select.value, notes: '' }); queueSave(); renderEditor(); };
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
    await state.charsDir.removeEntry(character._filename);
    // Only after the character file is removed should the UI forget this character.
    state.characters = state.characters.filter(c => c.id !== character.id);
    if (state.active?.id === character.id) {
      state.active = null;
      state.revision = state.savedRevision = 0;
      state.epoch++;
      cleanPortraitUrl();
    }
    let portraitFailure = null;
    if (character.portraitFile && character.portraitFile.startsWith(character.id + '.')) {
      try { await state.portraitsDir.removeEntry(character.portraitFile); }
      catch (error) { if (error.name !== 'NotFoundError') portraitFailure = error; }
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
    await state.writerDir.removeEntry(novel.folder, { recursive: true });
    state.novels = state.novels.filter(n => n.id !== novel.id);
    if (state.novel?.id === novel.id) clearNovelState();
    renderNovelSelect();
    await showBookshelf();
    status('Saved to folder');
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
        entries.push({label:'Linked character',value: target.name + (link.incoming ? ' (linked from their profile)' : '')});
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

function init() {
  $('selectFolderBtn').onclick = selectFolder;
  $('reselectFolderBtn').onclick = selectFolder;
  $('changeFolderBtn').onclick = selectFolder;
  $('newWriterBtn').onclick = createWriter;
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
  $('retrySaveBtn').onclick = () => void flush();
  $('downloadUnsavedBtn').onclick = downloadUnsavedProfile;
  $('backupBtn').onclick = backupLibrary;
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
    if (hasUnsaved() || !!state.saving) { event.preventDefault(); event.returnValue = ''; }
  });
  setStage('folder');
}
document.addEventListener('DOMContentLoaded', init);
