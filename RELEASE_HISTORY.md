# Release History — Character Bookshelf

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


