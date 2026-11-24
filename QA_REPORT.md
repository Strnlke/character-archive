# Character Bookshelf v4.2.5 — QA Report

**Build:** v4.2.5, based directly on the complete v4.2.4 release. **Test date:** November 24, 2026. **Status:** QA candidate, not deployed by developer.

## Intended changes
- Return the existing title element to the front of generated covers in Standard and Compact Cover views.
- Show the extra legible title box **only** for adaptive cover widths below 150px (not for standard-width books).
- Keep uploaded cover images unchanged and visible in Cover View; preserve vertical spine titles and full-title hover/focus/touch previews.
- Correct the placement of series and delete controls to remain over cover faces when compact title labels are visible.
- No changes to schema, writer files, backup, recovery, map interactions, manuscript processing or series links.

## Tests actually run

| Check | Result | Scope |
|---|---|---|
| Node tests (model, syntax, startup, visual/source assertions) | **25/25 PASS** | Existing regression suite plus 2 new cover-title assertions |
| Browser: six books, desktop 1366px, no uploaded art | **PASS** | Original title visible; no external label; spine titles vertical; hover title works |
| Browser: thirty books, desktop 1366px, no uploaded art | **PASS** | Small labels visible; original title still visible; badges/delete on face; spine/title preview |
| Browser: thirty books, desktop 1366px, all uploaded covers | **PASS** | Images displayed unchanged; compact labels; real vertical text in spine mode; hover title |
| Browser: thirty books, tablet 740px | **PASS** | Compact labels and book-face text retained; responsive layout; spine view |
| Browser: thirty books, phone 390px | **PASS** | Compact labels and book-face text retained; responsive layout; spine view (mouse emulation, not touch) |
| Browser page JavaScript errors in tested scenarios | **0 observed** | Logged page errors on all five synthetic fixtures |
| Map redraw/print, physical USB, real ZIP restore, live GitHub Pages, Android | **NOT RUN** | Unchanged code or hardware outside fixture scope; requires real-device QA |

## Important limitations
- Browser fixtures use generated sample novels and simulated covers, not your private library. They test presentation rather than genuine File System Access permission and disk writes.
- The newly generated screenshots are from synthetic browser fixtures and do not certify the deployed website.
- No full re-test of map pan/stamps/save/recovery or large manuscripts was performed in this focused CSS hotfix. Existing tests still cover pure map data and syntax.
- Writer files remain local: no migration and no automatic rewrite were introduced.

## Acceptance checklist
1. Back up your actual writing library and retain v4.2.4 before deploying the complete v4.2.5 ZIP.
2. Confirm footer shows v4.2.5 after publishing and hard-refreshing. In your small original library, cover titles should be printed on the book faces, not in separate boxes.
3. Open Claire's 30-book demo: verify supplementary labels in compact cover mode **and** the original tiny lettering still on each book; check that uploaded book artwork is unchanged.
4. Switch to Spine View, check all titles vertically aligned. Hover/focus to reveal a full title and check series badges, delete controls and manuscripts.
5. Open and close World Maps with disposable data to ensure its unchanged interactions still work after deployment.

**Conclusion:** v4.2.5 passes focused source and browser tests, but remains a QA candidate pending your actual GitHub Pages and device acceptance.
