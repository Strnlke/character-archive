# Character Bookshelf v4.2.3 — QA Report

**Report date:** November 24, 2026  
**Build:** v4.2.3 Map Interaction & Adaptive Bookshelf  
**Verdict:** Focused automated checks passed. Real-device acceptance pending.

## Scope and method

1. **Node map model and interaction tests (20 of 20 passed):** `node --test tests/*.mjs`. Existing map-model tests cover schema invariance, independent map copy, selective merge, image-free recovery and duplicate safety. The startup test checks parse requirements. The new v4.2.3 interaction tests cover annotation cloning/new identity, size/rotation/color retention, stroke-point translation, repeated reversible resizing, shape/text/stamp sizing, and immutable source data.
2. **Isolated Chromium map UI exercise:** Page assembled in a Playwright `about:blank` frame with equivalent source/markup and in-memory mock local folder handles. Exercise: initialize writer, create blank map, add stamp, native double-click select, Ctrl+C then Ctrl+V, drag empty region to pan, Fit to Screen, create text label, native double-click to edit saved text. No page exceptions observed in this sequence. Found and repaired the intermediate no-op-click DOM rebuild that swallowed native double-click selection.
3. **Isolated Chromium bookshelf UI exercise:** Rendered 30 fictional novel records in an in-memory writer state. Checked cover and spine modes, shelf counts, responsive geometry and computed spine presentation. No source novel data was changed in this test.
4. **Static/source checks:** Confirmed release version and asset cache-busting references, HTML/CSS/JS source presence, recovery numerator/denominator conversion, new helper import, absence of the previous Select/Pan toolbar controls.

## Results and evidence

| Test group | Result | Qualification |
|---|---|---|
| Node automated tests | 20/20 pass | Pure model/startup/interaction helper tests |
| Map simulated browser workflow | Pass for exercised actions | Mock storage, `about:blank` inline harness, no USB dialog |
| Adaptive bookshelf simulated browser workflow | Pass for exercised layout DOM | 30 fictional novels; screenshots not accepted as universal pixel fidelity |
| Real writer library and live GitHub Pages | Not run | Needs owner acceptance |
| Real USB/storage disconnect/conflict recovery | Not run | Critical high-risk area, not certified |
| Android/mobile gesture and export/printing fidelity | Not run end-to-end | Needs physical-device QA |

## Known limitations / cautions

- Managed browser policy in this environment blocks normal localhost navigation. `about:blank` isolated harness tests are useful **but not equal** to full integrated live deployment.
- Changing writer bookshelf view persists in the current browser per writer; storage-disabled browsers retain only session preference.
- Writer ZIP and recovery limits remain those of the v4.2.2 architecture; this release does not expand them.
- Browser clipboard keyboard shortcuts operate on map annotations, not across unrelated tabs or programs.
- Real hardware should check: repeatedly enlarge/reduce stamp and verify its center; multi-click stamp selection/drag/deselect; editing saved text after reload; copy/paste/Undo/Redo; scrolling/zoom/Fit; series group ordering; 30-book bookshelf on laptop and phone; backup/restore and unplugged-media behavior.

## Deployment note

Back up the user's writer library and retain the full preceding release before publishing all v4.2.3 files. No source code or writing data was changed on the user's live site by this QA run.
