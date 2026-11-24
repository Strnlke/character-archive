# Character Bookshelf v4.2.1 — QA Report

**Build:** v4.2.1 World Maps full-page and interaction revision  
**Baseline:** The complete v4.2.0 World Maps release from the prior user-visible delivery, based on the uploaded v4.1.3 source.  
**Status:** Packaged for Chief QA review; **not deployed and not production-certified**.  
**Data safety:** All tests performed against code and model fixtures, **never the user's live writing library**.

## Changes checked

1. **Full-page workspace:** Modal host replaced with a dedicated in-app page, backed by the existing same-origin writer-folder bridge. Back button respects pending writes.
2. **Compact interface:** Map list can collapse; toolbar shows a single row with a contextual stamp chooser, View menu, Object/Maps menus, and exports; Characters page controls are smaller.
3. **Pointer interactions (code review):** Initial Fit now measures the visible canvas container; Pan changes the SVG viewBox directly; Select moves the active SVG object's attributes without rebuilding all objects for every pointer move; erasing uses the pointer-down target plus a tolerance for thin strokes.
4. **Stamps:** Muted hybrid cartography linework replaces the bright cartoon style. Transparent hit regions make stamps easier to grab but are stripped from export output. Forest clusters remain one saved object.
5. **Exports:** The guide grid is editor-only; explicit opt-in when rendering the editor, explicit exclusion from SVG/PNG/Print-to-PDF. The source/annotations choices are preserved.
6. **Data and rollback:** Original map data SCHEMA 1 retained. Source images are still excluded from RAM recovery, with filename/fingerprint metadata kept; independent copied maps and revision/history behavior are unchanged.

## Automated tests actually executed

| Verification | Result | Scope |
|---|---|---|
| Map-data model tests | **9 / 9 passed** | Blank map, cluster count, independent copies, merge/duplicate/selected merge, incompatible merge protection, image-free recovery, legacy separation |
| Node JavaScript syntax | **9 / 9 passed** | All JavaScript/ES modules in release |
| CSS parser validation | **5 / 5 no top-level parser errors** | Existing and new CSS files |
| HTML duplicate ID validation | **2 / 2 passed** | Main Bookshelf and World Maps pages |
| Static integration assertions | **14 / 14 passed** | Host, toolbar, pointer-path implementation, recovery exclusion, no-grid export, navigation |

## Not tested — explicitly outstanding

- **Live pointer gestures in Chromium:** Attempted Playwright headless Chromium but the managed browser blocks localhost/data/file navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. No pointer-drag, pan or eraser browser test is counted as passed for v4.2.1.
- **Visual acceptance:** No current v4.2.1 rendered browser screenshot available due the same navigation restriction. Historical `world-maps-v420.png` in tutorial assets is labelled as an older v4.2.0 reference, not the new UI.
- **Real hardware:** USB disconnect/reconnect, actual Edge browser on Chief QA's small laptop, Android file authorization, touch, keyboard accessibility and mobile breakpoints.
- **Stress and integrations:** Huge 12K canvases, high stroke counts, PNG memory thresholds, Print/Save as PDF layout, large source-image re-linking, full writer restore, interrupted write and every v4.1.3 regression workflow.

## Suggested user acceptance sequence (use a disposable library)

1. Deploy all files of the new complete ZIP to a staging folder/site; retain v4.2.0 and v4.1.3 full ZIPs and independently back up real writer data.
2. Open a test novel's World Maps. Confirm it is a full page, not a dialog; Back returns to the existing page; sidebar collapses; there is no nested vertical scroll.
3. Create a grid-enabled blank map; confirm visible map at first open without using Fit. Exercise Pan and Fit at 100%, zoomed in, and zoomed out.
4. Place Single Tree, Large Forest and Mountain Range; drag repeatedly using Select; switch to Pencil, draw and check cursor; erase stamps and thin strokes; Undo and Redo.
5. With grid visible, export SVG and PNG, then Print/Save as PDF. Confirm grid is absent. Check both complete-map and annotations-only output.
6. Save/reopen, copy into a novel/series, create combined version, import all/selected annotations, Undo; verify source map unchanged.
7. Test missing image warning, original filename, re-link, blank conversion and reset safeguards; inspect writer ZIP and recovery inclusion/exclusion.
8. Verify other Character Bookshelf pages and the reviewed character JSON-import workflow remain functional.

## Release disposition

**Candidate for manual acceptance; not recommended as a replacement for a known-good v4.1.3 library workflow until the specific reported interaction bugs are retested on real hardware.** Changes are additive to `world-maps/` and do not migrate existing novel/character JSON. Keep the complete prior release ZIP for rollback. Neither this QA run nor packaging changed the live GitHub Pages deployment or user's local files.
