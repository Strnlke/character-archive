# Character Bookshelf v4.1.1 — Unified Bookshelf Patch

Character Bookshelf is a locally stored writing-reference application for writer profiles, novels, characters, relationship trees, structured timelines, manuscript reference copies, and writer backups. The library remains in a folder you explicitly authorize (typically a USB flash drive). The application does not synchronize your records to a cloud account.

## Install / upgrade from v4.1 or v4.0.2

1. **Export a writer ZIP backup and separately copy your entire existing Character Bookshelf USB folder.** Verify that your originals are safely retained before testing an update.
2. Extract this ZIP. In your GitHub repository's existing `character-archive` Pages root, replace **`index.html`, `app.js`, `styles.css`, `series-v41.js`, `manuscript-v41.js`, `tutorial.html`**, and the **entire `tutorial-assets/` folder**. Keep those filenames and directories exactly as supplied; all assets are local and load alongside `index.html`.
3. Commit and allow GitHub Pages to deploy, then refresh the page when no edits are pending. The HTML requests versioned `?v=4.1.1` JS and CSS assets to help avoid stale browser cache.
4. Open your usual USB library. Start with a **copied test library** or a disposable writer before opening important work. Check the storage-status panel and verify at least one normal save and writer ZIP backup.
5. Leave your prior working source files (v4.1 or v4.0.2) available as a rollback option. **Do not restore an older source while unsaved edits are pending.**

**Supported for USB-folder access:** recent desktop Chrome and Edge using HTTPS (e.g., GitHub Pages) or localhost and their File System Access API. Other browsers may not support the same folder authorization workflow. The reader is responsive, but browser file-system permissions and pop-out window behaviors vary by platform.

## Five feature areas

**1. Character mentions while reading manuscripts.** An additional character sidebar in the read-only TXT and DOCX viewer lists **all characters from that book**, including zero-match profiles. Choose a character to view grouped mentions, their context, and next/previous navigation; click a mention to jump and highlight. Searches match whole words and user-entered **Aliases & nicknames** (Basic Information). The existing native **PDF viewer still works**, but character mention counts/jumps/highlights **are not yet available for PDF**, because browser-native PDF text cannot reliably be queried by this app.

**2. Smaller volatile RAM recovery.** Imported manuscript reference files (PDF, DOCX and TXT) are intentionally omitted from the emergency RAM snapshot, leaving more memory for irreplaceable character and novel information. Essential JSON data is prioritized. This temporary snapshot is cleared by reload, browser close or crash. **Normal exported writer ZIPs STILL INCLUDE manuscripts.** The source manuscripts should also be stored independently. Old imported files are not silently deleted when the application cannot confirm that they're an unchanged reference copy.

**3. Illustrated, optional tutorial.** Select **Getting Started Tutorial** on the writer selection screen after selecting a storage location, or **Tutorial** in the footer from any application page. The full text-and-screenshot guide has nine clickable subjects, enlarged-image links, and a **Pop out** button for side-by-side practice. Nothing launches automatically. The guide is release-specific and should be updated with subsequent feature releases.

**4. Cached, writer-specific search index.** Repeated library searches use a temporary in-memory index rather than re-reading each character JSON file on every query. The index is invalidated on tracked saves and Refresh View, and also ages out (90 seconds) to limit stale results after external edits. Exact whole-word search behavior and result navigation remain intact.

**5. Linked novel Series.** Create an optional named series and link existing books; use arrows to order them. Linked covers are placed next to one another on the bookshelf. The Series page combines existing per-novel timelines without duplicating event records. Entries without an explicit year/date remain in **Undated / relative events**, labeled with their source book. **Copy character** creates a new independent profile/portrait in another linked book. Relationship references are deferred until both copied endpoints exist; then they resolve to the new IDs. Once established, each book's character edits and relationships remain independent. A manually deleted copied relationship is not auto-recreated. A character already copied from the exact source book is detected; similarly named but unrelated profiles require user confirmation.

## Storage, compatibility, and known limits

- **No library migration is needed.** Existing novel, timeline and character files retain their formats; optional series data is stored as `character-bookshelf-series.json` in each writer's folder. Copied character profiles can add provenance and pending-link fields; existing profiles are not mass-modified.
- Writer ZIP backups include series metadata and imported manuscripts. Emergency RAM snapshots exclude manuscript bytes. Recovery never replaces a permanent, independently stored backup.
- Complex DOCX layout may not reproduce precisely. PDF character mention indexing remains unavailable in v4.1; PDF page navigation stays with the native viewer.
- Series timelines use explicitly entered years or parseable absolute dates. They never guess a year from relative descriptions. Undated items are identified by source book.
- The initial character index for a huge writer library still needs a scan; repeated searches benefit most. Indexes are volatile and intentionally temporary.
- Browser pop-up blockers may require allowing the tutorial pop-out on your GitHub Pages site.
- Source files are unminified. The existing bundled JSZip notices are retained in `app.js` and `THIRD_PARTY_LICENSES.md`.

## Verification

See **`QA_REPORT.md`** for test scope, results, and environment limits. This release was tested in a disposable simulated Chromium USB file system; it was **not** tested against your real flash drive or the deployed GitHub Pages site. Preserve a separate backup and verify a few test saves before using it for unrecoverable work.

See **`RELEASE_HISTORY.md`** for earlier releases.

## v4.1.1 bookshelf refinement

Linked novels appear on the **same regular bookshelf rows** as all other novels,
next to their series companions. There are no separate series-only shelves.
A small ◇ series label on each linked book opens that series directly.
Standalone books are displayed normally. No library-data migration is needed.
