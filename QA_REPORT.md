# QA Report — Character Bookshelf v4.2.7

**Date:** November 27, 2026  
**Release type:** Focused editable-map import hotfix, complete build based on v4.2.6  
**Assessment:** Candidate for owner acceptance testing, not yet field-certified on physical USB or deployed GitHub Pages

## Scope
- Add import of editable maps from other local storage folders into the current writer's active novel or series.
- Preserve existing map JSON schema, writer discovery, bookshelf UI, backup/recovery and World Maps interactions.
- Avoid changing any source files. New independent map copies only; never overwrite/merge by matching name.

## Automated test summary
- Node test runner: **35 passed / 0 failed**.
- Native SHA-256: valid source image accepted, modified image rejected.
- Static syntax checks: app.js, world-maps.js, new import module.
- Chromium simulated File System Access:
  1. Source writer folder discovery, map preview, and complete image-backed map import.
  2. Correct generated ID, two editable annotation objects, original image bytes and filename, verified source hash.
  3. Source map JSON left byte-for-byte identical.
  4. Corrupted image rejected without registering an additional map.
  5. JSON-only map import kept annotations and recorded Unlinked image state.
  6. Simulated destination file-write failure did not add a map or leave staged image/map files behind.
  7. Embedded bookshelf iframe imported the map to the selected destination novel rather than the source's old owner ID.
  8. No browser page errors in tested interactions.

## Limitations and handoff
- The synthetic browser test ran in a restricted-origin harness with a deterministic WebCrypto substitute for simulated-file consistency. A separate native Node test verified genuine SHA-256 fingerprint behavior.
- No physical USB, genuine browser folder chooser, Windows folder drag/drop, Android, live GitHub Pages, or extensive end-to-end recovery stress test.
- One-folder map import intentionally does **not** restore an entire World Maps backup ZIP. Single JSON imports cannot automatically find their source image.
- The previously reported mobile sidebar, fit and pinch zoom issues remain open for a separate release.

## Owner acceptance checklist
1. Back up BOTH locations. Open the destination writer and novel in Character Bookshelf.
2. Choose World maps → Map files → Import Saved Map → Choose source folder.
3. Select the old writer folder, verify title, object count, source image state, and destination novel.
4. Import and inspect the complete saved map, then verify saved state and writer backup.
5. Check that the old folder remains untouched. Keep v4.2.6 release ZIP for rollback.
