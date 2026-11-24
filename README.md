# Character Bookshelf v4.2.2 - World Maps Startup Hotfix

**Status:** Source-complete QA candidate. This is a hotfix for the **v4.2.1** broken World Maps screen, not a redesign or data migration.

## What was broken
The v4.2.1 `world-maps.js` file had an unclosed function call in the pencil pointer-move handler. That single JavaScript syntax error prevented the World Maps ES module from loading at all. Consequences: `No folder connected`, `Opening your writer's World Maps...`, disabled New Map, unresponsive controls, and maps that appeared missing. The issue did not itself delete map data.

## What's fixed
- Corrected the missing `)` in the drawing code.
- Added a visible startup failure message rather than showing a frozen editor when scripts do not load.
- Prevented a mismatched or failed embedded Bookshelf connection from suggesting a different folder picker; Back to Bookshelf remains available.
- Close other toolbar menus when one is opened and close the menu after choosing an action.
- New cache-busting version strings and updated version/release notes.
- Kept original map schema (1), local folder layout, annotation files, image files, and all recovery behavior unchanged.

## Installation (do not overwrite your writing library)
1. **Before deployment:** make a full writer ZIP backup, a separate copy of the library, and retain the complete v4.2.1 and v4.1.3 release ZIPs for rollback.
2. Extract this package and publish **all** extracted files, preserving relative paths, to the existing GitHub Pages repository. Do **not** upload the ZIP itself, only `world-maps.js`, or omit `world-maps-core.mjs`.
3. Wait for GitHub Pages publication and hard-refresh Edge/Chrome (Ctrl+Shift+R). Confirm the Character Bookshelf footer shows **v4.2.2**.
4. Open your existing Stern Lake novel, choose **World Maps**, and confirm the title shows **World Maps / Stern Lake**, the list loads, and **New Map** is enabled. Do **not** use `Choose Local Folder` from a disconnected map editor to look for existing book maps.
5. Confirm your prior map(s) appear. Open one; test draw, stamp, erase, Undo/Redo, save, and reopening using a **disposable map** before using important writing data.
6. If the map list remains empty despite a connected editor, check that the exact same writer profile and selected library folder are in use. The maps are expected under that writer's `world-maps/maps/` directory; do not remove anything before diagnosis.

## Data safety
The hotfix makes no changes to prior novel or character JSON schemas and does not migrate/delete existing `world-maps/` files. The repair works by restoring the code path that reads the existing files. Normal backups include map image files; volatile RAM recovery excludes source-image bytes, as before.

## QA performed
- World Maps source parsed successfully as an ES module using `node --input-type=module --check` (the correct mode; earlier v4.2.1 checks missed this error).
- Existing map data model: **9/9 tests passed**.
- Browser smoke test in an isolated `about:blank` Chromium frame with **mock local-folder handles and a mock digest**: connected a writer, created a map, placed a stamp, drew pencil stroke, erased stamp, saved and reopened map after recreating the frame. No page errors in that test.
- Browser smoke does **not** establish live GitHub Pages, real File System Access permissions, real USB behavior, large image imports, Android, full pointer regressions or PDF print correctness. The testing environment blocks direct `localhost` navigation; those still need real-device QA.

See `QA_REPORT.md` and `QA_REPORT.pdf` for scope and limitations.
