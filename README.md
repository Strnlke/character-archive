# Character Bookshelf v4.2.5 — Classic Covers & Compact Titles Hotfix

**Status:** Full-source QA candidate, prepared November 24, 2026 from the verified complete v4.2.4 release ZIP. **UI-only update:** no changes to writer data files, save/recovery rules, imported covers, maps or manuscripts.

## What changed

- **Standard Cover View:** Book titles are again printed on the book faces, exactly as in the classic bookshelf. The external title box is hidden when cover width is at least 150px.
- **Compact Cover View:** When automatic adaptive sizing produces a book width **under 150px**, a small two-line title box appears above each book. The title printed on the book face stays visible, even when that lettering is too small to read easily.
- **Uploaded covers:** Original image remains unchanged. The title box may appear in compact mode, but uploaded art is not modified or painted over.
- **Spine View:** Titles remain vertically typeset in live HTML text, even with uploaded covers; no external title box.
- **Full-title previews:** Brief mouse hover, keyboard focus, or touch long press still reveals the complete title. Existing series badges and delete buttons stay positioned over the cover face.
- **World Maps:** No interaction, drawing, copying, exporting, or saving code was changed. Map scripts and model are carried forward from v4.2.4.

## How to install

1. Make a full writer ZIP backup **and** a separate copy of your entire selected writing-library folder before updating. Keep the v4.2.4 complete release ZIP for rollback.
2. Extract the entire v4.2.5 ZIP; upload **all** its files and folders to the GitHub Pages repository, preserving relative paths. Do not upload just one HTML/CSS/JS file.
3. Hard-refresh Edge/Chrome after GitHub publishes the changes (Ctrl+Shift+R). Confirm the footer displays **v4.2.5**.
4. Test with disposable libraries first: a six-book bookshelf should show just the classic covers; Claire's 30-book demo should show compact title boxes **and** the original lettering on the book faces. Toggle Spine View and verify titles remain vertical. Check an uploaded cover, series badge, hover titles and manuscript buttons.
5. Reopen World Maps and check basic interactions. Only after your own acceptance testing should you use the updated application with your normal writing library.

**Rollback:** Re-upload the previous complete v4.2.4 package. Neither release changes the saved-library schema, so this is a code-only rollback, not a substitute for a real backup.

## Limits

The Node and Chromium browser checks use disposable sample content, not your actual library or physical USB. No live deployment, full ZIP backup/restore stress test, Android touch test or broad map functional regression was performed for this CSS-focused hotfix. The complete tests and limits appear in `QA_REPORT.md` and `QA_REPORT.pdf`.
