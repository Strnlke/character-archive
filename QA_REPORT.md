# Character Bookshelf v4.2.4 — QA Report

**Build:** v4.2.4, derived from full v4.2.3 release. **Test date:** November 24, 2026. **Status:** QA candidate; not deployed by developer.

## Change scope
- Cover title ribbons, full-title previews, modest minimum width and original artwork retention.
- Vertical spine labels with uploaded cover images, regardless of collection size.
- Selected-stamp-only contextual size/rotation controls in World Maps, with fixed canvas geometry.
- No changes to original writer/novel/character/series/map schemas, writer data paths, save verification, backup/recovery caps, or copy synchronization rules.

## Verification results
| Test | Result | Scope / evidence |
|---|---|---|
| Node test suite (map model, syntax, source assertions, map startup, new UI regressions) | **23/23 passed** | Node v24 runtime, local source; source assertions are not UI interactions |
| CSS parsing of changed styles | **3/3 files clean** | tinycss2 on `bookshelf-v423.css`, `bookshelf-v424.css`, `world-maps.css` |
| Simulated Chromium bookshelf: 30 books, 1366×820 | **Pass** | Title ribbons, uploaded-image title elements retained, spine vertical, uploaded image hidden only in spine, hover/focus tooltip; no JS page errors |
| Simulated Chromium bookshelf: 6 books, 1366×820 | **Pass** | Same checks on small collection |
| Simulated Chromium bookshelf: 30 books, 740×820 | **Pass** | Narrow viewport, title ribbons, spine vertical, hovered/focused tooltip; no JS page errors |
| Simulated Chromium map editing | **Pass** | Mock folder picker/digest; new blank map, stamp select/deselect, scale up/down and readout, unchanged viewBox/stage height, copy/paste, pan, Fit, text re-edit, autosave; no JS page errors |
| PNG/SVG/PDF export and live File System Access | **Not run** | Legacy functions unchanged; user hardware acceptance required |
| Full physical USB, Android, GitHub Pages deployment | **Not run** | No access to real target or physical device |
| Full writer ZIP restore, unplugged USB/emergency recovery and complex existing maps | **Not run** | No authoritative claim of end-to-end recovery certification |

## Confirmed observations
- In simulated bookshelves containing uploaded cover artwork, the live title text remains in each cover DOM and is typeset vertically in Spine View, unlike v4.2.3 when the image replaced it.
- In the map simulation, selected stamp controls appear only while a stamp is selected, and shrinking immediately after enlarging restores the same displayed scale. Camera viewBox and canvas height did not change when the context strip appeared or its size controls were used.
- Every test used disposable fictitious books, mock file handles or a synthetic World Map, not the user's original manuscripts or active writing folder.

## Limitations and follow-up acceptance
- Localhost navigation is blocked by the managed Chromium testing environment; map browser testing therefore ran from an isolated synthetic document with combined module sources and a mocked File System Access folder plus mock digest. This is not equivalent to a live same-origin GitHub Pages and physical file picker workflow.
- Desktop/mouse and responsive CSS were checked; actual touch long-press, Android/mobile browser differences, screen readers, and real hardware behavior still require hands-on evaluation.
- Popover controls may visually overlap transient toast notifications. This is cosmetic, not a verified data-loss issue.
- Existing copyright/use reminders remain for imported map images. Source image bytes are excluded from RAM recovery but preserved in normal full backups, subject to current limits.

## Release instructions / data safety
1. Back up the actual writer folder independently; keep complete v4.2.3 ZIP for code rollback.
2. Publish complete v4.2.4 web root and relative assets; confirm the footer and reload all changed JS/CSS.
3. Test in Claire's disposable writer library first. Cover/Spine views: multiple collections, uploaded art, series labels, tooltips, delete controls, manuscript buttons and writer switch. World Maps: selected-stamp controls, geometry/camera stability, copying, Undo/Redo, import/backup/recovery.
4. Do not delete or overwrite any original map or library files to solve UI errors; report the exact steps and browser width if a bug occurs.

**Conclusion:** Focused visual/interaction tests pass in disposable Chromium fixtures. v4.2.4 remains a QA candidate pending actual deployment and device/library acceptance; no real writer data was modified during these tests.
