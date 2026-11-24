# QA Report - Character Bookshelf v4.2.2

**Release:** World Maps Startup Hotfix | **Date:** November 24, 2026
**Build source:** v4.2.1 complete release | **Disposition:** QA candidate

## Failure reproduction and root cause
User screenshots showed `No folder connected`, `Opening your writer's World Maps...`, disabled `New Map`, and unresponsive tools after v4.2.1 deployment. Inspecting v4.2.1 `world-maps.js` revealed an unclosed `setAttribute()` call in the pencil pointer-move handler. A correct Node ES-module parser reported `SyntaxError: missing ) after argument list`. The error stops the entire editor module from initializing and prevents connection to the existing writer's map directory. The visible symptoms do not establish file deletion.

## Changes
- Corrected the single missing `)` in the pencil pointer-move statement.
- Added error-state text for JS module startup failures.
- Embedded World Maps fails clearly if the Bookshelf writer bridge is missing or cannot connect, without suggesting a second folder.
- Exclusive open-menu behavior and menu close on action.
- Updated cache-busting/version and release documentation. No data/schema changes.

## Verifications run
| Check | Result | Limitation |
|---|---|---|
| World Maps ES-module parsing (`node --input-type=module --check`) | PASS | Actual source syntax, not live network loading |
| Existing world-maps data-model tests | 9/9 PASS | Isolated model fixtures |
| New startup regression tests | 3/3 PASS | Source/integration assertions |
| Chromium browser: writer connection, new map, stamp, pencil stroke, eraser, autosave, reopen existing map | PASS | Embedded synthetic DOM and mock File System Access/digest; not live GitHub or physical USB |
| Browser runtime errors during synthetic scenario | 0 | Limited to scripted test actions |
| ZIP structure + file hashes | PASS | Static package integrity |

## Not verified
Live deployed GitHub Pages behavior; actual author-side folder selection and USB permission; Android/touch; corrupted or partial real library; full backup/recovery; very large map rendering/export; all drawing/panning/Undo scenarios. Automated browsers were blocked from navigating to localhost in this execution environment.

## Safety and rollout
Keep previous complete ZIP and an independent actual-library backup. Install complete v4.2.2 source, hard-refresh, confirm footer version. Reopen an existing novel -> World Maps. If it still says disconnected, do not create a different library: check browser console/network, complete file publication, and the selected writer folder. Do not remove old maps or overwrite their image/JSON files.
