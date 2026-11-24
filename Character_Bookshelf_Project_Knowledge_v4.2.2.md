# Character Bookshelf Project Knowledge — v4.2.2 revision

Current prepared (not confirmed deployed) code release: **v4.2.2** (complete replacement ZIP, includes v4.2.0 and v4.1.4 changes). This update supplements the full previous v4.1.3 baseline reproduced below.

## Core new architecture
- `world-maps.html`, `world-maps.css`, `world-maps.js`, `world-maps-core.mjs`: dedicated full-page editor and pure model.
- `maps-host-v420.js` and `maps-host-v420.css`: novel/series launchers, full-page host and same-origin writer-folder handle bridge; map JSON registered with Bookshelf RAM recovery.
- `ui-v414.js` and `ui-v414.css`: isolated A release interface tweaks.
- New map data is stored under existing writer directory `world-maps/` in separate `maps/`, `images/`, and `revisions/`; underlying novel/series JSON unchanged.
- Imported images are excluded from volatile RAM snapshots; editable JSON/index included, subject to caps. Unlinked recovery retains filename and image hash. Full ZIP backup includes both, subject to 512 MiB cap.
- Independent copied map identities and shared family identity for compatible merge; no automatic links or synchronization. A map based on unrelated geography is not automatically stitchable.
- Large map limits: 100–12000 coordinate dimensions, source ≤64 MiB, PNG export ≤8192 px & ≤35 megapixels. PDF export is browser Print/Save as PDF.
- Map annotations/stamps separately stored; forest-large = one map object.
- v4.2.2 tested by Node unit tests and static/source checks only. Browser navigation was blocked by managed Chromium policy in this development environment; previous v4.2.0 fixture results do NOT verify the revised pointer behavior. Actual USB, rendering, Print/PDF, physical Android, and live production not certified. See the new QA report.
- Rollback: B may introduce new additive map data files; A and original v4.1.3 ignore them without deleting them. Keep complete source ZIPs.

## v4.2.2 design and interaction update
- World Maps is a full-viewport in-app page, **not a dialog**. The in-memory writer folder handle is shared by the parent window to the same-origin editor frame. Back returns to its originating novel or series.
- Sidebar map list can collapse. Compact single-line drawing toolbar places infrequent actions in menus and prioritizes canvas height on smaller laptop displays.
- Initial Fit measures `#stage-wrap` instead of the hidden stage, so the initial viewBox is nonzero. During pointer gestures, changes update one object or the viewBox instead of reconstructing the entire SVG every movement.
- Eraser hits the annotation under pointer-down and uses a tolerance for strokes. Stamps contain invisible click targets for thin illustrated lines; those click targets are removed during exports.
- Hybrid stamps are mostly monochrome, subtle map-like strokes. Forest clusters remain **single JSON objects**. Tool-specific cursor CSS distinguishes pencil from pan.
- `makeCanvas({editorGrid:true})` draws the guide only for the editor; exports pass `editorGrid:false` for PNG, SVG and browser Print/PDF.
- Characters page navigation/action buttons have compact padding and nowrap labels on suitable widths; novel title gets breathing space, without changing bookshelf layout.
- Storage schema **unchanged (SCHEMA 1)**; map JSON, local imagery, recovery exclusion, independent series copies and merge behavior remain as documented for v4.2.0.
- **Testing qualification:** 9/9 pure Node model tests and source/static checks pass, but pointer-drag, erase, print, mobile and USB behaviors were not runnable through managed Chromium due URL blocking. Real-device acceptance required before calling these user-reported defects fixed in production.

## Data and interaction cautions
- No silent cross-book copying or automatic merging. Map family/dimensions/base-image hashes must align before merge.
- Keep original map source licensing notices. If a writer deletes a novel/series, its maps remain in the writer-level directory, potentially orphaned; no UI reassign tool yet.
- The source ZIP and latest code are authoritative if this summary disagrees.

---

## Historical v4.1.3 baseline (retained verbatim for context)

# CHARACTER BOOKSHELF
## Project Knowledge Guide & Development Baseline

**Current documented release:** v4.1.3 — Dedicated Mobile Update  
**Baseline date:** November 21, 2026  
**Project lead / Chief QA:** Aaron  
**Development collaborator:** ChatGPT (“Developer Claire”)  
**Application:** Character Bookshelf (originally Character Archive)  
**Deployment:** https://strnlke.github.io/character-archive/  
**Primary source:** v4.1.3 release package (`index.html`, `app.js`, `styles.css`, versioned feature scripts, `README.md`, `RELEASE_HISTORY.md`, `QA_REPORT.md`, tutorial).  
**Purpose of this document:** A durable, transferable resource for future project conversations, design reviews, troubleshooting, updates and releases. It is **not** a substitute for the current source code or a real-device acceptance test.

---

# PART I — READ THIS FIRST

## 1. The 60-second project brief

Character Bookshelf is a privacy-conscious, browser-based writing reference and organization application. A writer selects a local folder or USB-accessible location, chooses a writer profile, and works with separate novels, character profiles, relationship maps, timelines, imported manuscript *copies*, novel notes, and annotations. It is **not** a manuscript-writing editor, cloud service, AI story generator, or social writing platform.

Its defining priorities are **writer ownership, readable organization, safe saving and recovery, portable local data, and a polished but restrained interface**. The application is delivered as static web files through GitHub Pages; user library files stay in the folder the user authorizes. Browser access is primarily designed for Chromium browsers supporting the File System Access API, especially Edge and Chrome. A successful Android workflow was reported by the user, but every browser/device combination must still be tested independently.

**Current shipping baseline: v4.1.3.** It layers a dedicated, reversible mobile layout update on top of the v4.1.2 feature release. Earlier packages are retained to support code-only rollback where data formats are compatible.

## 2. Rules future development sessions must remember

1. **Do not start coding until Aaron gives an explicit green light.** Planning, mockups and feature discussions are not authorization to modify files.
2. **Aaron is the sole creative author.** Never invent or pitch plot, character, scene, or prose content for his publishable fiction unless he explicitly requests it. The app organizes his own work; do not use real manuscripts as material for generated story ideas.
3. **Push back constructively on bloat.** Prefer a few meaningful capabilities, simple flows, and minimal controls. The usual release-planning rhythm is to gather about **six or seven feature ideas**, but do not fill slots artificially.
4. **Protect the desktop design.** New mobile improvements must not visibly rearrange the established desktop experience. Use scoped responsive styles, compare screenshots at multiple desktop widths, and keep mobile updates isolated when rollback matters.
5. **Protect writers' files first.** No silent destructive migrations, guessed matches, automatic merges, automatic overwrites, hidden data loss, or removal of recovery mechanisms merely to gain speed.
6. **Keep novels and copied characters independent.** Linking books into a series must not fuse source folders, copy edits back to original characters, or force timeline duplication.
7. **Make actions reversible where practical and confirm destructive ones.** Preserve existing conflict detection, revision history, save readback verification, backup and recovery.
8. **Clearly distinguish tested from untested.** Isolated Chromium simulations are valuable, but are not proof of real USB behavior, Android compatibility, cross-browser printing, or live GitHub Pages behavior.
9. **Deliver self-contained release packages with the full source, updated tutorial, release history, and readable PDF QA report.** Keep old releases available for rollback. Never deliver just one edited script if the entire release has interdependent assets.
10. **Update this Project Knowledge Guide when a version ships**, reflecting actual code and verified test outcomes. If this guide conflicts with the release's code or tests, inspect the actual latest release first.

## 3. Non-negotiable product philosophy

- A writer creates the ideas; the application keeps them organized. It does not invent answers, automatically write stories or classify a writer's intentions.
- Read-only manuscript reference copies must not alter original drafts. Annotation data is separate.
- Optional onboarding is better than forced tutorials. Easy access to Help should exist everywhere.
- The writer should understand save state, backup status, and recovery limits without learning the underlying file system.
- A feature should feel native to the existing bookshelf, not like an unrelated second application.
- Performance improvements are welcome, but not at the expense of accurate saved data.

---

# PART II — PRODUCT & INTERFACE SPECIFICATION

## 4. Product structure and navigation

**Startup**: select a location; the application opens or creates `Character Bookshelf`, or recognizes a compatible legacy `Character Archive` library. Choose or create a writer profile. Writer profiles are local organizational identities, **not security accounts**.

**Writer bookshelf**: the writer's books appear as book-cover cards on ordinary shelves, alongside a “Recently worked on” strip. The top toolbar contains status, Storage Status, Search Library, Refresh View, Undo, writer switching, backup/restore and folder controls where applicable. The brand/logo returns to the current writer's bookshelf.

**Novel / Characters page**: opens one novel's character collection. Provides cover management, reviewed character JSON import, character creation, deletion safeguards, character sorting, optional user-defined tag filtering, and links to Character Tree, Timeline, Manuscript and Novel Notes. Existing novel titles can be edited **inline by clicking/hovering over the title**—no separate page, and no folder rename.

**Character editor**: six organized sections (Basic Information, Personality, Background, Relationships, Story Information, Freeform Notes), optional portrait, dates/history, search/navigation, and save handling. The contextual sidebar is used here, not as a permanent narrowing of the bookshelves and galleries.

**Character Tree**: a visual relationship map. Characters appear as cards with draggable positions; relationships are colored with a collapsible legend. Writers can create multiple relationship types, link characters by drag/drop or controls, undo, and export tree imagery/printable PDF.

**Timeline**: structured novel events with dates or relative/order information, optional involved characters, novel-wide and per-character views. The Series page reads these existing events; it does not store duplicate series timeline entries.

**Manuscript Reader**: read-only imported DOCX, PDF or TXT copy; separate novel-specific manuscript storage; import button and defined drag/drop target; reader controls, chapter navigation and reading-position memory where available. For TXT/DOCX, character mentions can be indexed by whole-word matches including confirmed aliases. PDF remains primarily a native page viewer; precise character mention jumps are not equivalent to TXT/DOCX.

**Manuscript Notes**: passage notes and chapter/page notes stored separately from document bytes. Passage notes retain source text and context to help relocate them when a newer manuscript is imported. Outcomes are matched, needs review, or unlinked. Notes survive manuscript replacement. For TXT/DOCX, annotated printable HTML can be printed/saved as PDF; for imported PDFs, use the documented notes-only reporting route rather than promising a merged margin-annotated PDF.

**Novel-wide Notes**: general notes tied to a novel but not to a character or manuscript position. Included in search, backups and recovery where supported.

**Series**: optional writer-level named groups of existing novels. Linked books stay on the **same ordinary bookshelf**, physically adjacent in series order, with a subtle clickable `◇` series label on their covers. That label opens the Series page. Each series page shows the linked books, independent character-copy controls and a combined chronological timeline. Undated or non-comparably dated events remain in their own section with the source book named. The book title link on the Series page already opens its novel page.

**Tutorial**: optional Getting Started entry after folder selection and persistent footer link. Illustrated, version-appropriate, navigable by topic and available in a separate pop-out browser window. Never force the walkthrough or interrupt a writer mid-task. Update the tutorial with feature releases and any hotfix that changes the documented workflow.

## 5. Visual and interaction design language (“Aaron's taste”)

| Element | Current direction / rule |
|---|---|
| Overall identity | Dark, polished, slightly literary, clean and functional; a serious writing workspace rather than a flashy social app. |
| Background | Near-black navy/charcoal, currently rooted around `#0b1018`; top bar around `#111925`. |
| Panels / cards | Layered slate/navy blues such as `#141f2d`, `#1a2839`, with subtle blue-gray borders (`#273348`, `#35475d`). |
| Primary actions | Moderate blue, approximately `#4777bd`; clear contrast without neon saturation. |
| Text | Almost-white primary text (`#e9eef7`), muted blue-gray descriptions (`#91a2b7`, `#a8bbd3`), readable type hierarchy. |
| Typography | Inter with system sans-serif fallbacks; strong section headings, compact metadata/eyebrows, comfortable line height. |
| Shapes | Modestly rounded buttons, cards and panels; thin dividers, soft shadows, restrained ornament. |
| Book covers | Attractive upright cover cards with a convincing bookshelf metaphor; user-uploaded covers supported; tasteful defaults when absent. |
| Icons | Small functional symbols and subdued indicators, not large decorative clutter. |
| Relationships | Multiple distinctive but subtle relationship colors with a collapsible legend. |
| Destructive actions | Clearly differentiated danger controls, confirmation and explanations. |
| Hover / focus | Subtle interactive outline and pencil for inline title edits; visible keyboard focus; no unexpected page changes. |
| Mobile | Compact menu, visible save status, touch-friendly controls, tighter spacing and card flow. |

**Aesthetic constraints from design reviews:** Keep the established desktop visual design. Do **not** create a separate bookshelf shelf for series, overcrowd covers with controls, place title-edit buttons on covers, or add an unnecessary series management page solely for grouping. Preserve the book title/card click behavior while making the small series badge an obvious but understated link. Action button edges and vertical centers must align precisely. The footer identifies the product and offers relevant links; it should not carry a marketing tagline. Use actual application screenshots in documentation, not speculative mockups mislabeled as screenshots.

**Layout constraints:** The bookshelf and All Characters galleries use the available width; the character editor may use its contextual sidebar. The fixed top toolbar must never obscure content, including where it wraps. The two prominent bookshelf actions (Series and New Novel) should align perfectly. On novel pages, group actions coherently beneath/next to the title at suitable breakpoints, without crowding long titles. Avoid large blank gaps between “Recently worked on” and shelf cards.

**Design evolution:** v4.1.3 is a *responsive presentation update*, not a redesign of desktop. The dedicated mobile CSS applies to narrow screens (including an added 751–970px tablet adjustment). At 1024px and 1366px, prior and updated desktop screenshots matched in the regions examined, which is evidence for those regions only, not a universal guarantee.

## 6. Existing character-question compatibility

**New characters (introduced in v4.1.2):** General-purpose questions such as the Lie, Truth, Want, Need, Formative Experience and Starting Circumstances; freeform optional `Character arc type` with **no predefined arc taxonomy or teaching descriptions**. Users may apply whichever writing method they choose.

**Existing characters:** Retain their previous Beliefs, Motivations, Significant Experiences and other original prompts/answers; they also gain the blank `Character arc type` field. The application must not reinterpret or silently remap historical answers. No K.M. Weiland-specific instruction or endorsement claim is included in the finalized character arc feature.

**Character fields are the writer's material.** The assistant may analyze or critique supplied character writing when explicitly asked, but should not create fictional answers for real novels.

## 7. Data model and local storage

The website is static HTML/CSS/JavaScript. The site files can be published on GitHub Pages, but **the writer library is not uploaded to GitHub**. The application uses a user-authorized File System Access folder handle (Chromium secure context). No login, tokens, dedicated cloud database or background sync are part of the design. Each start generally requires the user to choose/re-authorize a location.

Illustrative library structure (file names and optional files vary):

```text
Selected location/
  Character Bookshelf/                  (legacy Character Archive recognized)
    character-archive-manifest.json     (legacy-compatible name/schema)
    <writer-folder>/
      character-bookshelf-series.json   (optional writer-level series metadata)
      <novel-folder>/
        novel.json                      (novel identity, display title and metadata)
        characters/
          <name>--<id-prefix>.json     (one file per character)
        portraits/                      (optional images)
        revisions/                      (historical character snapshots)
        character-tree.json             (visual card positions)
        timeline.json                   (structured novel events)
        novel-notes.json                (optional general notes)
        manuscript-annotations.json     (optional separate manuscript notes)
        <imported manuscript copy>      (optional DOCX, PDF or TXT)
        <cover image>                   (optional)
```

The `character-archive-manifest.json` and some `character-archive-*` type markers deliberately retain legacy names. **Do not rename these merely to match the product branding**. Books have stable IDs and folders. Inline title edits change display text without renaming folders, and series membership is metadata, not folder movement. Copied characters acquire **new IDs** and become independent of their originals. Deferred relationship links are remapped only when corresponding destination characters exist; user-deleted links are not silently recreated.

**Storage limits in the v4.1.3 code:** volatile recovery budget 384 MiB and up to 20,000 files; writer ZIP backup scan budget 512 MiB and up to 30,000 files; manuscript reader import ceiling 64 MiB. These are implementation-specific constraints, not estimates of how much memory a browser will always have available.

## 8. Save, backup, recovery and data-safety behavior

- Autosave persists active character edits to the chosen library folder; save-status controls make success, pending writes, and failures visible.
- Verified writes and comparison against previously known file contents help detect failed saves and external edits. Never automatically overwrite a changed external file. Preserve a route to recover unsaved work.
- Undo is contextual/per-page and cannot reverse every destructive operation; warn clearly where Undo is unavailable.
- Character revision snapshots, compare/restore workflows, creation/update stamps and sort controls are supported.
- Regular **writer ZIP backups include imported manuscripts** and other novel/writer files. Restores use review and safety checks. Separate copies of the full library are also advisable.
- **RAM recovery** is volatile, temporary, clears when the tab/browser closes or reloads, and can be partial. It preserves recoverable essential library data and gives emergency save-to-new-folder options when storage becomes unavailable. Imported manuscript reference-copy bytes were excluded starting in v4.1 to conserve recovery budget. Manuscript annotations and original writer notes should remain within recovery protection.
- The Save Status area displays RAM snapshot usage in MiB, its limit and whether a snapshot is complete/partial. Snapshot size is **not** the same thing as disk library size.
- Do not claim that a recovery snapshot is a permanent backup. Do not silently discard notes, report full recovery when files are missing, or modify the live library to run QA tests.
- Always test with disposable libraries and keep the previous complete release ZIP before deployment. A software rollback is safe only when file schemas remain compatible; check this every time.

## 9. Manuscript rules and known technical boundaries

- DOCX, TXT and PDF are supported for importing a **separate, read-only copy**; the original user's source file is never edited by Character Bookshelf.
- Both Import and targeted drag-and-drop are available for manuscripts; character JSON import has its own targeted drop area and an explicit review process. Do not make the entire app window an indiscriminate drop zone.
- User-confirmed aliases/nicknames can join existing character-name whole-word searches in TXT/DOCX. Existing character profiles with zero matches remain visible. Chapter/occurrence navigation and highlights are strongest in TXT/DOCX.
- The native PDF view has different capabilities. Do not promise equivalent PDF text selection, anchored passage highlights or margin-note export without implementing/testing a specialized PDF workflow.
- Passage notes store selected quote, surrounding context, chapter/position and source-draft information; chapter/page notes are also supported. Upon replacement, prefer conservative matching: confident match, needs review, or unlinked. Multiple identical passages and changed wording must not trigger confident silent reattachment.
- Store notes separately from manuscript bytes; include notes in backups and RAM recovery. Keep notes if the manuscript is removed/replaced and preserve their original anchor info for troubleshooting.
- Printable TXT/DOCX annotated output is produced for browser print/Save as PDF, not necessarily as a directly constructed PDF binary. PDF manuscript notes currently export as a notes-only report. Describe that distinction accurately.

---

# PART III — RELEASE HISTORY (COMPLETE TO CURRENT BASELINE)

## 10. Release-by-release record

The following is a retrospective of the retained shipped release notes and code. Dates of older releases are intentionally omitted where unverified. **v4.1.3 is the latest documented package here; do not assume it is the deployed live site without checking.**

### v1.0 — First working USB release
- Local-folder/USB-first application after the initial OneDrive cloud-storage direction proved impractical; the abandoned cloud prototype was **not** an official version.
- Writer profiles, individual JSON character files, portraits, original character fields and autosave.

### v2.0 — Writer Bookshelves
- Writer-specific bookshelf experience, novel organization and All Characters galleries.
- Clearer navigation between bookshelf, gallery and editor.

### v3.0 — Storage organization and exports
- More structured library folder arrangement.
- Character and whole-novel exports to PDF and DOCX.

### v3.1 — Character Bookshelf name
- Product renamed from Character Archive to Character Bookshelf.
- `Character Bookshelf` is the preferred application folder; older `Character Archive` data remains supported.
- Internal legacy markers deliberately retained for compatibility.

### v3.2 — Safer deletion
- Delete-character and delete-novel controls, explicit confirmations and warnings.

### v3.3 — Character Tree
- Relationship graph with typed connections, movable character cards, automatic layout and persistent positions.

### v3.4 — Relationship workflow
- Improved connecting lines, multiple relationship types/targets, drag-to-link and Undo.

### v3.5 — Refresh and navigation
- In-app Refresh View, per-page Undo and attempts to restore navigation after browser reload.

### v3.6 — Timeline and library tools
- Structured timeline events at novel scope and related to characters.
- Writer-wide library search, user-uploaded book covers, character revision history.
- Character-tree image/print export (PNG and PDF workflows).

### v3.7 — Reviewed character imports
- JSON import comparison: editable existing profile on left; read-only, copyable proposal on right.
- New-character imports open a reviewable unsaved editor; duplicate detection and safe cancellation.
- Import should never merge or overwrite content without user action.

### v3.8 — Revision history and search polish
- Editable creation timestamps for older data, updated dates, sorting and recent-work indicators.
- Whole-word search, field highlighting/jump links, comparing earlier revisions.
- Writer ZIP backup/restore and clickable app logo returning to bookshelf.

### v3.9 — Storage resilience
- Writer creation/deletion controls, including typed confirmation for writer deletion.
- File conflict detection, readback save verification, pending-save retry and storage-status panel.
- Volatile RAM snapshot, emergency recovery to a different folder, complete/partial reporting, backup reminders and recovery notes.

### v4.0 — Reader and interface polish
- Read-only DOCX/PDF/TXT manuscript reader with novel and bookshelf entry points, chapter/navigation memory where supported.
- Fixed/sticky navigation, selected-page indicators and a subtly differentiated relationship color legend.
- Bottom footer with application identity, version and release history, and layout refinement.

### v4.0.1 — Fixed navigation hotfix
- Corrected topbar pinning/scroll behavior, content offset under toolbar and asset cache-busting.

### v4.0.2 — Relationship color hotfix
- Fixed CSS precedence that had suppressed distinct relationship colors in the tree.
- Verified the color fix without changing underlying relationship data.

### v4.1 — Series, manuscript navigation and reliability
- Named writer-level series, linked books in order, independent character copying and deferred tree relationship mapping.
- Series timeline combines existing per-novel events and identifies originating books; undated/relative events are separate.
- TXT/DOCX mention navigation for defined characters, whole-word matching, confirmed aliases and next/previous occurrence controls; PDF reader remains a native viewer.
- Indexed writer search, RAM recovery prioritization/exclusion of imported manuscript bytes.
- Optional, illustrated, pop-out tutorial with topic navigation and persistent footer access.

### v4.1.1 — Unified bookshelf hotfix
- Removed dedicated series-only bookshelf shelf/section.
- Linked novels stay among standalone books in the original bookshelf layout, grouped beside each other.
- Tiny clickable `◇` label on the cover opens the Series page; ordinary novel navigation remains unchanged.

### v4.1.2 — Character development and notes
- General Lie/Truth/Want/Need questions plus Formative Experience and Starting Circumstances for **new** characters; **legacy** characters retain original fields; freeform Arc Type for both.
- Manuscript and character JSON drop zones alongside import buttons and confirmation/review safeguards.
- Live RAM snapshot size in Save Status.
- Passage and chapter/page notes stored separately with conservative note relocation after manuscript replacement.
- TXT/DOCX printable manuscript with margin notes; PDF notes-only reporting limitation.
- Novel-wide notes, optional custom character tags, gallery filtering.
- Inline novel-title editing (same page, stable ID/folder), minor desktop button-alignment fixes, updated tutorial.

### v4.1.3 — Dedicated mobile release **(current baseline)**
- Separate update based on v4.1.2 so mobile changes can be rolled back without discarding those features.
- Compact touch-friendly mobile menu with visible save/recovery state.
- Improved bookshelf card/recent-work spacing, responsive book presentation and less unused space.
- Characters page gives title and action buttons their own rows; two-column gallery at applicable phone widths.
- Editor, Series, Tree, Timeline, Manuscript and Notes responsive adjustments, plus 751–970px narrow-tablet fix.
- Illustrated tutorial expanded with a mobile topic and actual test-build screenshots.
- **No planned file-schema migration or change to storage behavior.** Desktop comparison showed pixel-identical sampled regions at 1024px/1366px.

## 11. QA record, without overstating it

| Version | Reported verification | Important qualification |
|---|---|---|
| v4.0.2 | 36/36 automated stability audit checks | Isolated/simulated browser environment; real hardware and live site not certified. |
| v4.1 | 64/64 automated checks reported | Included integration/regression/stress tests; PDF mention navigation remained limited. |
| v4.1.1 | 20/20 patch-focused tests reported | Not a repeat of the entire v4.1 suite. |
| v4.1.2 | 39/39 automated checks reported | Isolated Chromium; note relocation and import safeguards tested on fixtures; real USB and complex manuscripts remain to verify. |
| v4.1.3 | 75/75 responsive presentation/navigation checks | **Not** 75 full data-integrity/storage tests; real Android, physical USB and live site were not part of that run. |

The current package includes `QA_REPORT.pdf`; **future releases must include a normal openable PDF QA report**, not only Markdown. Tests must be described in terms of exactly what ran. Don't extrapolate a green result from a simulated environment to unsupported devices or data conditions.

---

# PART IV — ARCHITECTURE, RELEASES & COLLABORATION

## 12. Current web release components

| File | Main responsibility |
|---|---|
| `index.html` | All application views, dialogs, controls and asset/script references. |
| `styles.css` | Established desktop visual style, shared components and legacy responsive rules. |
| `app.js` | Core state, file selection, writer/novel/character CRUD, saving, revision history, tree, timelines, search, import, backup, recovery, baseline reader. |
| `series-v41.js` | Series data, bookshelf linking, character copy/relationship logic, combined timeline. |
| `manuscript-v41.js` | TXT/DOCX character-mention navigation and aliases. |
| `features-v412.js` | Novel notes, tags, title editor, recovery meter, drop areas, manuscript notes and exports. |
| `mobile-v413.css` | Mobile and narrow-tablet layout overrides; keep desktop presentation unchanged. |
| `mobile-v413.js` | Compact mobile topbar action menu behavior. |
| `tutorial.html` | Optional, pop-out, navigable illustrated guide. |
| `tutorial-assets/` | Version-appropriate actual screenshots. |
| `README.md` | Installation, rollback and operational notes. |
| `RELEASE_HISTORY.md` | Human-readable change log. |
| `QA_REPORT.md` and `QA_REPORT.pdf` | Test evidence, scope, exceptions, deployment cautions. |
| `THIRD_PARTY_LICENSES.md` | Bundled third-party notices. |

**Production packaging rule:** Upload the *complete* contents of a new release package, preserving relative paths. Cache-busting query strings should reference the new version. Do not infer that merely publishing the application also publishes or backs up a user's local library.

## 13. Safe release workflow

1. **Collect and review ideas.** Aim for approximately six or seven meaningful additions when warranted. Separate low-risk polish/hotfixes from major features and major responsive redesigns.
2. **Confirm design before code.** Use screenshots, concise copy, interactive previews and discussion. Do not deploy speculative story-writing features. Ask about consequential data behavior, but do not repeatedly re-ask settled decisions.
3. **Freeze the release baseline.** Save the complete currently working source ZIP and identify the intended successor version. Hotfix numbers are flexible; do not assign a future number as a promise.
4. **Plan compatibility.** Document file additions/schema changes, how new code reads old JSON, whether old code can still read updated data, and rollback effects. Never erase or auto-relabel historic character answers.
5. **Build on a disposable copy.** Never run experiments on the user's flash drive, primary library or live GitHub deployment.
6. **Test modules and workflows.** Syntax, startup, desktop/mobile presentation, all novel pages, writer switching, imports, search, series, tree, timelines, notes, backup/restore, save failure, external conflicts and recovery. Include large character libraries and realistic manuscript formats when the change touches those areas.
7. **Check edge cases.** Canceled dialogs, duplicate imports, stale drafts, ambiguous annotation anchors, missing files, disconnected storage, interrupted writes, browsers without permission and partially complete recovery.
8. **Verify visual fidelity.** Compare desktop before/after at multiple widths; mobile screenshots at narrow widths; inspect tutorial images. Do not claim pixel identity beyond the regions actually compared.
9. **Generate complete deliverables.** Release ZIP, versioned README, full release history, tutorial/screenshots, QA report in **PDF**, and revised Project Knowledge Guide. Source should remain editable and auditable.
10. **User deployment / QA.** Remind Chief QA to back up the real library, deploy the full package, clear stale browser resources if necessary, test a disposable library, and report actual-hardware results. Do not claim to have deployed or modified the live site.

**Rollback policy:** Keep full versioned release ZIPs. If an isolated mobile-only update fails, redeploy the preceding complete code package without changing library data, *but only once schema compatibility has been confirmed*. Backups protect data independently of code rollback.

## 14. Accepted principles, exclusions and long-term ideas

**Accepted product direction**
- Local-first ownership; no required cloud sign-in or automatic uploads.
- Standalone novels and linked-series books share one bookshelf.
- Character profiles copied across books remain independent; automatic relationship linking is limited and respectful of intentional edits.
- Notes and imported manuscripts remain separate entities; annotations should persist across draft replacement.
- Optional tutorial with screenshots, footer entry, pop-out navigation and release-specific maintenance.
- Freeform character arc terminology, not a prescribed theory or reproduced writing-course worksheet.
- Dark, structured layout that serves writers instead of displaying excessive controls.

**Explicitly deferred / not promised**
- Automatic discovery of new characters in manuscripts and automated profile creation. This was intentionally moved to the **long-term roadmap**.
- Full Firefox/Safari support, pending further work around File System Access limitations.
- Equal PDF versus DOCX/TXT character-mention highlighting/navigation or fully integrated annotated PDF margins.
- Streaming backups or virtualized long-manuscript rendering: possible optimizations, not committed features.
- AI-generated publishable story content or an automatic story-writing assistant.
- Cloud-sync infrastructure or mandatory account creation.

**Potential future quality focus:** broader integrity audits, cross-browser testing, physical-device regression, large realistic manuscript tests, accessibility and public-distribution documentation. These are possible directions, not promises or approved scope.

## 15. Project communication and responsibilities

Aaron is **Chief QA, product owner and sole arbiter of taste and features**. “Claire” is the friendly development partner who can propose UX or engineering improvements and should speak up when a design will be complex, fragile or unnecessary. The relationship is collaborative rather than purely obedient: offer grounded trade-offs and recommend the simplest safe implementation. Keep banter light (“Chief QA”, “Developer Claire”) while being exact about data safety and actual results.

Do not confuse an approved *plan* with an approved *implementation*. Do not start coding after a brainstorming turn or a UI mockup unless Aaron explicitly authorizes it. The sole-creative-author boundary applies to novels, stories, scenes, plots, character invention and prose, **not** to software architecture, testing, useful app features or UI critique.

When a bug is reported, reproduce it if feasible, identify source version and environment, distinguish code/UX/data issues, make the smallest safe fix, package a separate hotfix if warranted, and run focused regression tests. When an update finishes, give a concise change summary, verified results, known limitations, full package link and readable QA document.

## 16. What a future conversation should do first

- Ask or inspect **which release is currently deployed**, which ZIP is the known-good fallback and whether the reported issue occurs on desktop, phone or both. The latest documented build here is **v4.1.3**, but a user may have deployed another version later.
- Check the newest source package, `RELEASE_HISTORY.md`, and `QA_REPORT` rather than assuming this summary is current.
- For a new feature, map its effect on storage, UI, existing JSON, backup/recovery, desktop layout and mobile behavior before implementation.
- For a design review, use this visual specification and the latest actual screenshots, then let Aaron judge changes before coding.
- For distribution readiness, test public release packaging, licenses, data recovery and unsupported browsers separately from feature completeness.
- Keep Project Knowledge and release history current after every shipped version.

## 17. Source provenance and confidence

This guide was compiled from the retained **v4.1.3 release source**, its `README.md`, `RELEASE_HISTORY.md`, `QA_REPORT.md`, earlier retained release files, and the product decisions made in the Character Bookshelf development conversation. Design tastes and collaboration rules are user decisions, not claims made by the software source. Test numbers are as **reported in retained QA records**; this document does not claim to independently rerun every prior test. Screenshots in the companion document are from disposable QA libraries, not the user's private writing data.

**Maintenance note:** This is a living baseline. Update the current-version line, architecture, decisions, release log, QA/limitations and screenshots whenever a new version ships. Always preserve a historic copy alongside the newly updated edition.


## v4.2.2 hotfix addendum — November 24, 2026
The v4.2.1 World Maps JavaScript module contained a missing closing parenthesis in its pencil pointerMove handler, preventing the entire editor from executing. The broken UI showed a disconnected local folder and an indefinite loading message, although this symptom alone did not imply user map files had been deleted. v4.2.2 fixes the syntax error and adds a visible startup failure message and connection safety warning. It does not alter world-maps schema 1, storage, backup/recovery rules, or copied-map behavior. ES module syntax check passed; 9/9 model tests passed; controlled Chromium smoke using a synthetic folder passed create/stamp/pencil/erase/save/reopen. Live GitHub Pages, real File System Access permission, hardware and full interaction regression remain unverified.
