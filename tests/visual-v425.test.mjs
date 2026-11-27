import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const p=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=f=>readFileSync(resolve(p,f),'utf8');
test('compact-only cover label, original title, spine title and accessible tooltip supported',()=>{
 const css=source('bookshelf-v424.css'),code=source('app.js'),html=source('index.html');
 assert.match(html,/bookshelf-v424\.css\?v=4\.2\.5/);
 assert.match(code,/attachBookTitleTooltip\(button,titleBox,novel.name\)/);
 assert.match(code,/frame\.append\(img\)/);
 assert.match(code,/if\(!frame\.classList\.contains\('bookFront'\)\)frame\.replaceChildren\(\)/);
 assert.match(css,/data-shelf-compact="true"/);
 assert.match(css,/data-shelf-mode="covers"\] \.bookTitle\{display:block\}/);
 assert.match(css,/data-shelf-mode="spines"\] \.uploadedBookImage\{display:none!important\}/);
 assert.match(css,/writing-mode:vertical-rl/);
 assert.match(code,/button\.addEventListener\('focus'/);
 assert.match(code,/pointerType!=='touch'/);
});
test('stamp popover only shows for selected stamps and is not inside scrollable toolbar',()=>{
 const html=source('world-maps.html'),js=source('world-maps.js'),css=source('world-maps.css');
 assert.match(html,/id="stamp-context"/);
 assert.match(html,/id="stamp-scale"/);
 assert.ok(html.indexOf('id="stamp-context"')>html.indexOf('id="toolbar"'));
 assert.match(js,/const isStamp=selected\?\.kind==='stamp'/);
 assert.match(js,/updateStampContext\(\)/);
 assert.match(css,/\.main\{position:relative\}/);
 assert.match(css,/\.stamp-context\{position:absolute/);
});
test('versions match and no schema changes',()=>{
 assert.match(source('app.js'),/APP_VERSION = '4\.2\.8'/);
 assert.match(source('world-maps.html'),/world-maps\.js\?v=4\.2\.8/);
 assert.match(source('world-maps-core.mjs'),/export const SCHEMA = 1/);
 assert.match(source('index.html'),/app\.js\?v=4\.2\.8/);
});
