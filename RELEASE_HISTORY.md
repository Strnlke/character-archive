# Release History — Character Bookshelf

## v4.2.7 — Import Saved Editable Maps Hotfix (QA candidate)
- Adds an explicit **Map files → Import Saved Map** workflow to bring editable maps from a different writer/library folder into the active writer's selected novel or series.
- Accepts a source folder containing `world-maps/maps/` plus its image directory, or one map JSON file. Image-backed folder imports copy images only after SHA-256 source fingerprint validation; JSON-only imports remain Unlinked until re-linked.
- Always generates independent map/annotation IDs, previews source/destination, refuses ID overwrite, preserves original source files and never merges/synchronizes existing maps.
- Failed writes leave the map index unchanged and attempt safe cleanup of unregistered staged files; recovery/backup formats unchanged.
- 35/35 Node regression tests and simulated Chromium browser workflows passed; not yet validated on physical USB or live GitHub Pages.

## v4.2.6 — Writer Folder Discovery Hotfix (QA candidate)
- Detects unregistered writer folders copied directly into the active library by validating legacy book/series metadata.
- Writer selection gains a Scan button, external folder picker, Chromium folder drop area, and reviewed registration preview.
- In-place registration updates only the library manifest. External folder import copies to a new directory with per-file verification; existing writer data is not overwritten or merged.
- Refuses duplicate writer names/IDs, checks the manifest for external changes, and avoids accidental collisions with folders that exist on disk but are not registered.
- 30/30 Node tests and Chromium simulated-folder import scenarios, including actual Claire 30-book/312-file data, passed. No real USB/OS folder-drop/live deployment testing yet.


## v4.2.5 — Classic Cover Titles & Compact Labels (QA candidate)
- Restored on-cover titles for generated book covers in standard and compact layouts.
- Supplementary readable title boxes appear **only** when adaptive cover width is under 150px; standard covers have no separate box.
- Uploaded cover artwork stays unmodified; the existing full-title hover/focus/long-press preview remains for every book.
- Spine View continues using vertical, live text, including books with uploaded artwork. Book deletion and series badges stay on the cover rather than the compact label.
- No map-code, storage, recovery, writer/novel JSON schema, series behavior or imported manuscript changes.
- 25/25 Node tests and 5 focused Chromium bookshelf cases passed; real-device/live-site acceptance remains outstanding.


## v4.2.4 — Bookshelf Readability & Contextual Stamp Controls (QA candidate)
- Cover view gains consistent-height readable title ribbons above cover art. Titles truncate after two lines without changing the original cover file; complete title tooltip on hover, keyboard focus or touch long-press.
- Spine view always uses vertically typeset live text even for books with uploaded cover art. Book-cover content is preserved in the underlying DOM for mode switching and only shown in Cover View.
- Slightly less aggressive cover density protects legibility while preserving adaptive sizing, user-selected spine mode, and existing series grouping behavior.
- World Maps shows a compact resize/rotate popover only for a selected stamp; the overlay is absolutely positioned relative to the map workspace to avoid changing canvas dimensions or camera view. It hides on deselection or non-stamp selection.
- `bookshelf-v424.css` isolates the bookshelf presentation change. No local-library schema or map JSON change, migration, deletion, or automatic sync.
- 23/23 Node tests, browser rendering at 1366px (6 & 30 books) and 740px (30 books), and synthetic map-edit workflow passed. Live USB, GitHub Pages, Android, print/export and comprehensive backup/recovery still require actual hardware QA.

## v4.2.3 — Map Interaction & Adaptive Bookshelf (previous release)
- Default drag-to-pan navigation, double-click selection and saved text editing, Ctrl+C/V/D on annotations, fixed-center reciprocal resizing and permanently visible Fit to Screen.
- Adaptive bookshelf density and per-writer opt-in Spine View; recovery badge units converted to decimal MB for clarity.
- Previous candidate retained independently for rollback.

## v4.2.2 — World Maps Startup Hotfix (QA candidate)
- Fixed a missing closing parenthesis in `world-maps.js` pencil drawing logic; v4.2.1's entire map module failed to parse and therefore never connected to the writer's existing map files.
- Added a visible startup/connection failure state and removed the inappropriate standalone-folder prompt from failed embedded sessions.
- Improved exclusive menu handling, cache-busting, updated docs and realistic ES-module syntax testing.
- No schema migration and no deletion or replacement of map data; compatibility with v4.2.0/v4.2.1 map JSON retained.
- Browser smoke verified using disposable simulated storage; real GitHub/USB/device acceptance still required.

## v4.2.1 — World Maps full-page workspace, interaction repairs and hybrid stamps (candidate)

- Replaced the World Maps modal with a full-viewport in-app page while retaining the same writer folder bridge and independent map schema.
- Reorganized editor chrome: compact tools, contextual stamp chooser, collapsible map list, Views menu for Fit/zoom/editor grid, Back navigation.
- Fixed initial Fit using the visible stage container rather than the hidden SVG (preventing a zero-size viewBox).
- Reworked pointer gesture handling: move only the active object's SVG attributes during dragging; update the viewport directly when panning; preserve pointer capture without replacing the whole SVG tree mid-gesture.
- Eraser now removes the clicked annotation at pointer-down, with a small hit tolerance for thin pencil strokes; stamps include transparent selection hit regions that are removed from exports.
- Pencil uses a distinct pencil cursor; grabbing cursor appears only during Pan dragging.
- Stamps use restrained monochrome hybrid-cartography linework and retain one-object cluster storage.
- Editor grid never renders into any export format (PNG, SVG, Print/Save as PDF); it is visible only in the editor.
- Characters page nav/action buttons are smaller with single-line labels and better novel-title flex sizing.
- Maintains additive `world-maps/` storage, verified-save and image-excluded RAM recovery architecture; **no schema migration**.
- Confirmed 9/9 pure map-data Node tests; full browser pointer tests were blocked by Chromium environment URL policy and remain for real-device QA. No deployment performed.

## v4.2.0 — World Maps (Release B)
- Adds novel and series World Maps launchers, locally stored maps/overlays and limited recovery/backup integration.
- Blank canvas, optional grid and shapes; imported licensed image and independent annotations.
- Text, pencil, stamps/clusters, object editing, undo/redo.
- Independent series/novel copies; combined versions with all/select, preview, duplicate protection and revision.
- PNG/SVG/Print-to-PDF; Unlinked source re-link or blank/reset choices.

## v4.1.4 — Interface Refinement (Release A)
- Slim header; redundant top Storage Status hidden, footer status retained.
- Import Character upload/drop popover; reviewed imports preserved.

## Previous releases (retained source)

# Release History

## v4.1.3 — Dedicated Mobile Update

- Mobile-only compact action menu; save and recovery status remain visible.
- Fixed cramped book/novel headings and inconsistent action layouts on narrow screens.
- Tightened vertical gap above book covers; horizontally scrollable recent characters and shelf rows on phones.
- Touch-friendly navigation on character, tree, series, timeline, manuscript, notes, and character gallery views.
- Fix for 768px novel heading overflow; desktop reference at 1024px and 1366px pixel-identical in sampled regions.
- Tutorial expanded with mobile instructions and actual test-build screenshots.
- **No storage or file-schema changes.** Dedicated release for easy code-only rollback to v4.1.2.

---

# Character Bookshelf — Release History

## v4.1.2 — Character Development & Manuscript Notes

- General Lie/Truth/Want/Need prompts for newly created profiles; older profiles retain historical questions, with a freeform arc type for all.
- Drag-and-drop imports for manuscripts and character JSON, retaining existing confirmations and duplicate reviews.
- Current RAM recovery size in the save-status toolbar.
- Passage and chapter/page manuscript notes stored separately, conservative reattachment after revisions, and TXT/DOCX printable margin-note export (PDF imports have notes-only export limitation).
- Novel-wide notes, searchable across the writer library, and optional character tags with gallery filters.
- Inline book-title editing and desktop action-button alignment polish.
- Illustrated tutorial updated for this release; mobile redesign remains separate.


## v4.1.1 — Unified Bookshelf Series Links

- Removed dedicated bookshelf rows and headings for series.
- Linked books now remain among standalone novels on the ordinary bookshelf, grouped beside each other in series order.
- A subtle clickable ◇ series label on each linked cover opens its specific Series page.
- Updated the tutorial and actual bookshelf screenshot for the unified layout.

## v4.1 — Linked Novel Series, Manuscript Navigation & Reliability

- Link novels within a named series, display them together on the bookshelf, and reorder them without moving the original folders.
- Series page that merges per-book structured timeline events chronologically, with an explicit source-book label and a separate undated/relative-events section.
- Copy characters and portraits between linked books as independent profiles. Relationships are deferred until both copied endpoints are available, then remapped to the destination IDs. Intentionally removed links remain removed.
- TXT/DOCX manuscript character sidebar, confirmed aliases/nicknames, whole-word mention counts, chapter context, jump-to-occurrence highlights, and next/previous controls. The native PDF reader does not support precise mention indexing in this version.
- Exclude imported manuscript reference bytes from volatile RAM recovery, prioritize essential JSON, and retain imported manuscripts inside regular writer ZIP backups.
- Temporary writer-wide search index with save invalidation and staleness refresh.
- Illustrated, optional tutorial with nine navigable topics, real v4.1 screenshots, pop-out window and a permanent footer Tutorial link.
- Preserve the v4.0.2 fixed navigation and relationship colors, and existing USB library/character file formats.



This is an archival summary of the release notes built into Character Bookshelf v4.0. Entries are based on the retained development releases, not the unfinished OneDrive-era prototype. Precise historical release dates are omitted where unverified.

## v4.0.1 — Pinned Navigation Hotfix

- Fixed top toolbar positioning during page scrolling at desktop and mobile widths
- Reserved space automatically for the toolbar to avoid covering content
- Refreshed asset URLs to avoid stale stylesheet and script caches

## v4.0 — Visual & Manuscript Reading

- Sticky navigation and clearer active-page indicators
- Subtle, distinct relationship colors and a collapsible legend
- Read-only DOCX, PDF and TXT reader with novel and bookshelf entry points
- Version footer with complete release history
- Responsive navigation and layout refinements

## v3.9 — Storage Reliability & Recovery

- Writer deletion safeguards and simplified writer creation
- Verified writes and file conflict detection
- RAM snapshots, recovery to another folder, and recovery reports
- Storage status and backup reminders

## v3.8 — Character History & Library Tools

- Created/updated dates and sorting
- Whole-word writer-wide search with highlighted destinations
- Compare revisions and export or restore writer backups
- Recently worked on and clickable Bookshelf logo

## v3.7 — Character Import Review

- Compare proposed updates next to editable existing profiles
- Review imported new characters before saving
- Duplicate detection and safe cancellations

## v3.6 — Timeline & Library Enhancements

- Novel and character-linked timeline events
- Writer-wide library search and uploaded book covers
- Character revision history and relationship tree PNG/PDF export

## v3.5 — Refresh & Navigation

- In-app Refresh View
- Per-page Undo and preserved navigation after browser reload

## v3.4 — Relationship Tree Improvements

- Clearer tree connections and extended relationship types
- Multiple target connections and drag-to-link
- One-step Undo

## v3.3 — Character Tree

- Editable relationship map with automatic layout
- Persistent character card positions and relationship types

## v3.2 — Deletion Safeguards

- Delete characters and novels with confirmation warnings

## v3.1 — Character Bookshelf Naming

- Application renamed Character Bookshelf
- New Character Bookshelf folder name; compatibility with existing Character Archive folders

## v3.0 — USB Bookshelf & Exports

- Refined USB library folder organization
- PDF and DOCX character and whole-novel exports

## v2.0 — Writer Bookshelves

- Writer-specific bookshelves
- All Characters galleries and improved navigation

## v1.0 — Original USB Release

- First functional USB-based character library, writer profiles, autosave, portraits, and individual JSON character files
- Initial cloud storage integration proved unsuccessful, prompting a transition to USB-based local storage.


