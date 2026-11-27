import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../world-maps.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../world-maps.js',import.meta.url),'utf8');
test('saved map Cancel has no dependency on form validation',()=>{
 const dialog=html.match(/<dialog id="dlg-import-map"[\s\S]*?<\/dialog>/)?.[0];
 assert.ok(dialog,'import dialog present');
 assert.match(dialog,/<button id="import-map-cancel" type="button">Cancel<\/button>/);
 assert.doesNotMatch(dialog,/<button value="cancel">Cancel<\/button>/);
 assert.match(js,/\$\('import-map-cancel'\)\.onclick=\(\)=>\{if\(!importingExternalMap\)\$\('dlg-import-map'\)\.close\('cancel'\)\}/);
});
