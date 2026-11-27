import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('writer discovery recognizes legacy book and series metadata without requiring a writer marker',()=>{
 assert.match(app,/async function inspectWriterFolder/);
 assert.match(app,/character-bookshelf-series\.json/);
 assert.match(app,/novel\.json/);
 assert.match(app,/character-archive-novel/);
 assert.match(app,/No recognizable writer data/);
});
test('user approves registration; existing writer folder is not overwritten or merged',()=>{
 assert.match(app,/async function confirmWriterFolderImport/);
 assert.match(app,/await commitWriterRegistration\(manifest,writer\)/);
 assert.match(app,/A writer with that name already exists/);
 assert.match(app,/merging is not part of this hotfix/);
 assert.match(app,/const actual=await sourceRoot\.getDirectoryHandle\(pending\.insideFolder\)/);
});
test('external writer folder copy is preflighted, independent, and failure cleaned up',()=>{
 assert.match(app,/WRITER_FOLDER_COPY_MAX_BYTES = 512 \* 1024 \* 1024/);
 assert.match(app,/await preflightWriterCopy\(pending\.handle\)/);
 assert.match(app,/await copyFreshWriterFolder\(pending\.handle,dest\)/);
 assert.match(app,/if\(created&&!registered\)/);
 assert.match(app,/if\(!referenced\)/);
});
test('UI offers scan, folder choose, drag/drop, and a review dialog',()=>{
 for(const id of ['scanWriterFoldersBtn','chooseWriterFolderBtn','writerFolderDropZone','writerFolderImportDialog','writerFolderImportName','confirmWriterFolderImportBtn']){
   assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(app,/getAsFileSystemHandle/);
});
test('version is updated and all existing map source paths remain unchanged',()=>{
 assert.match(app,/APP_VERSION = '4\.2\.7'/);
 assert.match(html,/app\.js\?v=4\.2\.7/);
 assert.match(html,/maps-host-v420\.js\?v=4\.2\.7/);
});
