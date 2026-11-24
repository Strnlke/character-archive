# Character Bookshelf v4.1.4 — Interface Refinement (Release A)

This is a COMPLETE release built from the uploaded and inspected v4.1.3 Mobile Release ZIP. No data migration.

## Changes
- Slim desktop topbar; the redundant Storage Status control is hidden in the topbar while the existing footer link and visible save/recovery status stay intact.
- Characters page: Import character opens a small menu with **Upload JSON file** and the existing **Drop character JSON** zone. The original reviewer / conflict safeguard is unchanged.
- Recently Worked On, book covers, shelves, desktop spacing and original mobile menu are preserved.

## Installing later
1. Back up the real library (writer ZIP and separate physical copy) and retain the full v4.1.3 release ZIP.
2. Extract all files of this archive to your GitHub Pages site repo, preserving the directory structure. Replace all versioned files, not just the new scripts.
3. Publish then hard-refresh Edge/Chrome. Check footer version **v4.1.4**.
4. Use a disposable library for checks before relying on real data.

## QA limitations
Isolated Chromium DOM interaction checked (topbar visibility, footer link, import popover and Escape behavior); not a full drive, JSON import/duplicate, or cross-browser regression. Read `QA_REPORT.pdf`.

## Rollback
Redeploy the original full v4.1.3 ZIP. No data format changes in this patch.
