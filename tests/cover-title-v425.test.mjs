import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../app.js', import.meta.url),'utf8');
const css=readFileSync(new URL('../bookshelf-v424.css', import.meta.url),'utf8');
test('compact title condition is based on cover width, not universal',()=>{
 assert.match(app,/mode==='covers' && geometry.width<150/);
 assert.match(css,/data-shelf-mode="covers"\] \.bookTitle\{display:block\}/);
 assert.match(css,/data-shelf-mode="covers"\] \.bookTitleBox\{display:none\}/);
 assert.match(css,/data-shelf-mode="covers"\]\[data-shelf-compact="true"\] \.bookTitleBox/);
});
test('uploaded artwork and spine titles remain intact',()=>{
 assert.match(css,/\.uploadedBookImage\{position:absolute/);
 assert.match(css,/data-shelf-mode="spines"\] \.uploadedBookImage\{display:none!important\}/);
 assert.match(css,/writing-mode:vertical-rl/);
});
