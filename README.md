# Character Bookshelf v4.2.8 — Saved Map Import Cancel Hotfix

**Release date:** November 27, 2026. **Status:** QA candidate. **Base:** Complete v4.2.7 release, unchanged storage schema.

## What is fixed

In **World Maps → Map files → Import Saved Map…**, the **Cancel** button could do nothing, particularly when no source file was selected. The form contained required fields that were hidden before choosing a source; browser form validation prevented the dialog form from submitting, even on Cancel.

Cancel is now an explicit close action, independent of form submission and validation. It works with no source selected, with source data selected, and with incomplete required fields. No map import, source image, or save/backup behavior is changed. The existing **Escape** dialog dismissal remains available.

## Updating

1. Back up your library and any second source folder. Do not move or delete writing data.
2. Preserve the **full v4.2.7 ZIP** for rollback.
3. Publish **all files** from the v4.2.8 ZIP over the existing GitHub Pages application code. Do not replace your writing library.
4. Hard-refresh Edge with **Ctrl+Shift+R** and confirm the main app footer reads **v4.2.8**.
5. Open a novel's **World Maps → Map files → Import Saved Map…**. Click Cancel immediately; the dialog should close. Reopen it, choose the external folder, and confirm import still functions.

## Safety and scope

- No changes to writer or novel files; no migration.
- Source folders and imported map content are unchanged.
- No updates to sidebar, pinch zoom, or the mobile UI. Those are still planned separately.
- Same limitations as v4.2.7: map JSON or source folder, not a backup ZIP.

## Tests

See `QA_REPORT.md` for reproducible results. Tests use a simulated browser folder; no live USB or GitHub deployment has been verified.

## Rollback

Re-deploy the complete v4.2.7 **application code only**. Do not erase writing files.
