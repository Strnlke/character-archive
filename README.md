# Character Bookshelf v4.2.3 — World Maps Interaction & Adaptive Bookshelf

**Status:** Complete source QA candidate built on the v4.2.2 startup hotfix. **Not deployed** or validated with your live writer library. No novel/character/map data migration is planned.

## Changes in this release

**World Maps editor**
- The usual state is navigation: drag empty space to pan and use the mouse wheel to zoom. Separate Select/Pan toolbar buttons are removed.
- Double-click an existing stamp/shape/label to select it; double-click text to immediately edit existing wording. The selection remains until a blank click or Escape. Drag a selected object to reposition it.
- Pencil, Text, Stamp and Eraser remain optional modes. Click the active mode again or press Escape to return to navigation.
- Fit to Screen is a continuously visible toolbar action. Resize/rotate via Object menu; reversible resizing keeps a fixed center and reduces rounding drift.
- Ctrl+C / Ctrl+V copy and paste a selected map object with its visual properties; Ctrl+D duplicates; Object menu alternatives also provided. Pasted/duplicated objects have independent IDs; Undo/Redo remains available.

**Writer bookshelf**
- Cover dimensions adapt to collection density and screen width. Books are grouped on shelf rows, respecting linked-series groups where feasible, with tighter vertical spacing.
- Optional Spine View button toggles compact spines and returns to Covers. The choice is saved *per writer* in local browser preferences when allowed; it does not modify novel JSON.
- Recovery-size indicator now reports decimal MB with both numbers converted correctly. Internal RAM limit still 384 MiB (= 402.65 MB); internal storage data unchanged.

## Installation and rollback

1. **Back up your real writing library first** using the app's writer ZIP backup and separately copy the entire local writer folder. Keep your known-good full v4.2.2 ZIP.
2. Extract the entire new release package, then publish the *contents* to your existing GitHub Pages repository, preserving folder structure. Do not publish only the changed JS or the ZIP by itself.
3. Confirm GitHub Pages has finished deploying, hard-refresh in Edge/Chrome (Ctrl+Shift+R), and check that the footer says **v4.2.3**.
4. First try the optional Spine View and a *disposable* World Map in a test writer (the separate Claire demo library is suitable). Test navigation, selection, text editing, copy/paste, resizing, save/reopen and exports.
5. Reopen one existing map in the *same* writer and selected library folder. The map file format is unchanged. Never select a different folder or start deleting maps as a way to recover a supposedly missing map.
6. If needed, redeploy the full v4.2.2 code ZIP. Because this release does not intentionally change file schemas, code rollback is designed to remain compatible. Still preserve a separate data backup.

## Data and safety boundaries

- Source images and editable map annotations remain separate. Existing map image exclusion from *volatile* RAM recovery remains intact, while normal writer ZIP backup includes images subject to the existing scanning limits.
- Copying between series and novels remains explicit and independent. Combining annotations is still user-initiated, with preview and Undo.
- No cloud database or required sign-in is added; character/novel/series JSON schema and existing legacy manifest names are preserved.
- New bookshelf preference is browser-local rather than writer-file content; in a different browser the view may default to Covers.

## QA evidence and limitations

`node --test tests/*.mjs` passes **20/20** (map model, startup guard and new interaction helper checks). Additional isolated Playwright/Chromium tests exercised a simulated World Maps session with in-memory folder objects: create map, stamp placement/selection, copy/paste, drag-to-pan, Fit to Screen and edit an existing label; a separate simulated bookshelf DOM render used 30 books in Covers and Spines. These tests did **not** use the actual USB drive, real browser File System Access dialogs, deployed GitHub Pages, real Android touch events, actual user maps or comprehensive backup/restore failure scenarios.

See `QA_REPORT.md` / `QA_REPORT.pdf` for the exact test scope. The package is a **QA candidate** until validated on your hardware.
