# QA Report — Character Bookshelf v4.2.8

**Release type:** Focused Saved Map Import Cancel bug fix, complete package based on v4.2.7.
**Release date:** November 27, 2026.
**Status:** Owner QA candidate; no live USB/GitHub deployment verified.

## Reproduced defect in v4.2.7

Chromium reproduction using the actual v4.2.7 HTML: when the import modal opens without a source selected, clicking Cancel leaves the dialog open. The form has hidden required inputs (`import-map-title`, `import-map-owner`), which block the form's `method=dialog` submit. This is not a failure in map data or import discovery.

## Fix

The Cancel control in `dlg-import-map` is now a `type=button` control with an explicit dialog-close handler. The handler does not close while a verified map import is in progress. `world-maps.html` and `world-maps.js` are the only feature source files changed. Host and application version references, tutorial, release history, and documentation have been updated to 4.2.8. No map storage formats, recovery schemas, data readers, or saving behavior changed.

## Automated test results

- **36/36 Node tests pass** using `node --test tests/*.test.mjs`, including a new Cancel regression test.
- **Focused Chromium UI tests pass**: Cancel closes without a selected source; Cancel closes with a selected source and invalid/blank required title; dialog reopens successfully.
- **Full simulated map import regression passes**: image-backed import and SHA-256 identity, JSON-only Unlinked import, fingerprint mismatch rejection, failed-write cleanup, integrated bookshelf destination ownership, source files unchanged. No page JavaScript errors.
- Existing map schema is still schema 1; existing World Maps data and application functionality remain unchanged by this release.

## Not verified

Actual USB hardware, live GitHub Pages, OS folder picker, Android/mobile, and individual user data. Chromium tests use simulated File System Access storage, not a real flash drive.

## Owner acceptance steps

1. Back up both libraries and keep the previous v4.2.7 application ZIP.
2. Deploy entire v4.2.8 ZIP and hard-refresh; confirm footer v4.2.8.
3. Open World Maps > Map files > Import Saved Map. Immediately click Cancel; modal should close.
4. Reopen, select another writer folder, blank out the new map title, and click Cancel; it should close.
5. Reopen, complete an import, check its annotations and any original image, save status, and leave source folder unchanged.

## Rollback

Re-deploy the complete v4.2.7 code bundle only; do not delete or replace any writing libraries. No migration is needed.
