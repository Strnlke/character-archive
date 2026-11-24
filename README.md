# Character Bookshelf v4.2.1 — World Maps Usability & Stability Revision

This is a COMPLETE release based on the user-tested v4.2.0 full release, itself built from the uploaded v4.1.3 source and including the v4.1.4 interface refinements. It is a candidate for user acceptance testing, not a deployed or production-certified build.

## Installing later
1. Back up the actual writer ZIP and a separate physical copy of the entire local library. Keep the full v4.1.3 ZIP as your fallback, and v4.1.4 if you first deploy A.
2. Extract and upload **all** files and `tutorial-assets/` to the GitHub Pages repository; don't upload only `world-maps.js` or the ZIP itself.
3. Commit / publish, hard-refresh in Edge or Chrome, check footer `v4.2.1`.
4. Test first with a disposable novel and series, blank canvas, imported PNG/JPEG/WebP map, stamp/text/pencil/undo, save/reopen, copy/book/series, combine, preview, export, backup, simulated lost image/relink and recovery.
5. Only then try your actual library. Never use production data for experiments.

## Where to find World Maps
- Novel > Characters page > **World maps**.
- Series page > select a series > **World maps**.
- Editor opens as a **dedicated full-page in-app workspace**, not a modal. The Back button returns to the existing novel or series. It uses the writer's authorized folder without a second picker.

## Storage details
Within the selected writer's existing folder, the map feature adds:

    world-maps/
      world-maps-index.json    (map references, owner identity and metadata)
      maps/<map-id>.json       (editable shapes, strokes, labels, stamps and reference filename)
      images/<map-id>.png/jpg/webp  (original image bytes, separate from annotations)
      revisions/              (pre-combine / pre-reset map JSON revisions)

It does not migrate or rewrite novel.json, character files or series JSON. It uses stable IDs and independent copies. Book maps belong to the novel by ID but are physically stored under their writer-level `world-maps/` directory. When a novel or series is deleted, associated maps remain preserved in that writer's directory; reassigning orphaned maps is not yet available in the UI.

## Save, backup and recovery
- Map JSON/index writes use content comparison and readback verification. External file edits block overwrites.
- The app's existing writer ZIP backs up map JSON **and original images**, subject to the existing 512 MiB scan budget. Multiple large maps could exceed that limit. Use a separate full-folder copy if necessary.
- Volatile RAM snapshots capture new map JSON and index data within existing capacity/file-count limits, but **deliberately exclude `world-maps/images/` source image files**. On recovery, a missing image is marked **Unlinked**, with the original filename and SHA-256 fingerprint retained. Re-link the original image, convert to blank preserving drawings, or start over with confirmation and a revision JSON.
- The in-map **Emergency Recovery** action downloads JSON without source-image bytes; this is a separate fallback and not a substitute for writer ZIP.
- The in-map **Maps backup ZIP** backs up map files only, not the full writer library.
- Undo is a per-map in-memory history, not a permanent full-library rollback. Combining annotations creates a revision file before the operation and Undo reverts it as one action.

## Editing and exports
- Blank canvas, optional grid, basic shape templates; import licensed PNG, JPEG or WebP source map.
- Label text, editable pencil strokes with pencil cursor, click-to-erase (including tolerance for thin strokes), object dragging without full-map redraws, and cartographic monochrome stamps including one-object forest/mountain/village clusters.
- The compact, single-row toolbar has tool buttons, a contextual stamp selector, Undo/Redo, View and Object menus, and Export. The map list can collapse to widen the canvas.
- The editor grid is **never part of PNG, SVG, or PDF/Print exports**, even if enabled in the editor.
- Character page navigation and action buttons are smaller with single-line labels where space allows.
- Independent copies to books / linked series; combined copies separately editable. Merge all or selected annotations from compatible maps with preview and duplicate tracking.
- PNG, SVG exports; **PDF via browser Print / Save as PDF** (not a directly generated PDF file). Each supports complete map or annotations-only. Only include images you have rights to reproduce.

## Constraints and known limitations
- Intended for recent Chromium browsers with File System Access API, under HTTPS or localhost. Firefox/Safari are not supported for folder persistence. Mobile must be tested on real hardware.
- Source image ≤64 MiB; canvas 100–12000 pixels; PNG export capped at 8192 pixels and 35 million pixels total; no promise of unlimited-size browser printing.
- Combining requires shared map family identity, dimensions and reference-image fingerprint (if present); there is no automatic geographic registration of unrelated regional maps.
- The v4.2.1 revision has 9/9 pure data tests and JavaScript/static checks. **Live Chromium pointer-interaction tests could not run in this environment** due a browser URL-block policy. The UI and bug fixes must be tested on a disposable library in Edge/Chrome on real hardware before relying on them. See `QA_REPORT.pdf`.

## v4.2.1 QA checklist (on your own device before using real writing data)
1. Open a disposable novel and click World Maps. Verify the full page opens, the map list collapses, Back returns to Characters, and no extra vertical scrolling is required at your laptop resolution.
2. Create a blank map with a grid; click Pencil and draw several strokes. Confirm pencil cursor, smooth strokes, and Undo/Redo.
3. Place a Single Tree and Large Forest; drag each with Select; confirm stable movement without map jumps; use Eraser on stamps and on thin pencil strokes.
4. Select Pan and drag the map; use View > Fit and the mouse wheel to zoom; test at several zoom levels.
5. Export SVG/PNG/PDF/Print with the grid **on**; confirm there is no grid in output; export annotations-only and check the source map is absent.
6. Save and reopen the map; test novel/series independent copying and selective/all combine, then Undo the combine.
7. Simulate an unlinked image using a disposable map; confirm the original filename, Convert to Blank and Start Over safeguards.
8. Check normal Bookshelf pages, imported JSON review, status bar, backup, and recovery. Keep the prior ZIP as rollback.

## Rollback
Because World Maps writes only additive `world-maps/` files, older code can ignore them. Redeploy the complete v4.1.4 or v4.1.3 source if needed (keep map data backed up). The old code will not let you edit newly created maps.
