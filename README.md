## v4.0.2 hotfix — Relationship Tree Colors

The v4.0.1 tree renderer assigned each relationship a distinct muted color, but older CSS `stroke`/`fill` declarations overrode those assigned colors. This update removes the conflicting rules for the relationship lines, their glow, label text, and label borders. It does not alter any saved character files or change the manuscript reader.

**Install:** Replace `index.html`, `app.js`, and `styles.css` together in the GitHub Pages repository, commit, and reload the site after deployment (when no edits are pending). The HTML cache-busting query is updated to `4.0.2`. Your USB library does not need any migration.

**Test:** Open Test Novel → Character Tree. Confirm that Spouse/partner, Sibling, Dating/romantic partner, and Ex-spouse appear in subtly different colors; the legend should match each connection. Check a PNG export to ensure its colors remain correct.

**Verification:** Tested CSS/SVG rendering under local Chromium. Deployment on the live GitHub Pages site and actual USB remain to be checked.

## v4.0.1 hotfix

The v4.0 sticky navigation did not remain pinned in the user's deployed browser. v4.0.1 uses a fixed top bar with its actual height measured by a `ResizeObserver` so it stays on screen and does not hide page content, including after toolbar buttons wrap. This is a **navigation hotfix only**; existing v4.0 manuscript and library features are unchanged.

**Install:** Commit **all three** files (`index.html`, `styles.css`, `app.js`) from this release to your GitHub Pages repository, replacing the corresponding v4.0 files. The `index.html` asset references now include `?v=4.0.1` so the browser requests the updated stylesheet and application script. After deployment, refresh the page when no edits are pending, select the USB library as usual, and confirm that scrolling leaves the toolbar visible. If you need to roll back, use the original v4.0 release snapshot.

**Testing:** The top bar remained pinned in simulated Chromium scrolling tests at 1366px, 800px, 600px, and 390px viewport widths, with no content overlap at the top of the page. This has **not** yet been tested against the user's live website or physical USB library.

---

# Character Bookshelf v4.0.1 — Sticky Navigation Hotfix

**Upgrade from v3.9.** This release keeps the existing manually selected USB/library-folder storage model, writer profiles, per-character JSON files, backups, import review, revision history, timelines, and v3.9 emergency recovery. It does not upload the library to a server. No change to the existing character profile schema is required.

## What changed

1. **Sticky top navigation.** The top bar stays available while scrolling. On narrow screens the toolbar buttons can be scrolled horizontally rather than stacking across many rows.
2. **Subtle relationship colors.** Each of the 27 existing relationship types has its own muted line color, including in exported tree PNG/PDF images. Expand **Relationship color legend** below the tree to see the color meanings. Names and type labels remain visible as well.
3. **Read-only manuscript reader.** Every novel has a **Manuscript** button directly below its bookshelf cover and another button alongside **Character tree** and **Timeline** on All Characters. Import DOCX, PDF, or TXT, read it inside Character Bookshelf, replace it with a newer reference copy, or remove the reference copy. No manuscript editing controls are supplied.
4. **Application footer and full release history.** The bottom-of-page footer displays Character Bookshelf, Storage status, Release notes, and the running app version. Release notes include **v1.0 through v4.0**. The v1.0 entry documents the move from unsuccessful cloud-storage integration to USB storage. The earlier unfinished cloud prototype is not counted as a release.
5. **Refined breadcrumbs.** The existing navigation shortcuts remain, with a clearer current-page indicator.
6. **Active-page highlighting.** Subtle highlighting identifies selected navigation sections without changing their behavior.
7. **Responsive layouts.** Improved spacing and controls for narrower displays, including a compact mobile header and collapsible-width manuscript contents navigation.

## Install on your existing GitHub Pages site

1. **Back up your full USB `Character Bookshelf` folder** to another physical location. Keep a copy of the working v3.9 code too.
2. Extract `Character_Bookshelf_v4_0_Release.zip`.
3. Replace the **same three files** in your `character-archive` GitHub repository: **`index.html`, `app.js`, `styles.css`**. Upload them together to the root directory, not into a subfolder. The Word-reading library is already bundled into `app.js`; there are **no extra script or vendor files to upload**.
4. Commit, let GitHub Pages finish deploying, then load the site with **Ctrl + Shift + R** once (only when you are not recovering unsaved edits).
5. Re-select your normal USB library folder, choose a writer, and test the Manuscript button first with **Test Novel** or a copied test library.

Your writer, character, relationship, and timeline records are unchanged by the version upgrade itself. The manuscript reference is an optional addition to a novel's `novel.json` and book folder when you import one.

## Manuscript Reader — storage and behavior

- **File formats:** DOCX, PDF, TXT (up to **64 MiB per imported file**).
- **Copies, not links:** The imported manuscript is saved as a **new, separately named file** within that novel's USB folder. The source document on your PC is never edited. `novel.json` holds the copied file name, original file name, and import timestamp.
- **DOCX:** Locally parses the Word document into readable paragraphs and chapter headings, without external network calls. Detects styled headings and headings such as `Chapter 1`. Tables may be flattened; photos, footnotes, complex page geometry, floating elements, and exact Word typography are **not fully reproduced**. It is a reference reader, not a Word renderer.
- **TXT:** Shows the complete text and detects conventional `Chapter`/`Part` headings when present.
- **PDF:** Opens the PDF in the browser's built-in viewer with its original page layout. Use native viewer controls/bookmarks where supported, or enter a PDF page number using the application's **Page / Go** control. PDF chapter headings are **not automatically extracted** into the chapter panel.
- **Reading position:** TXT/DOCX scroll position and the PDF page entered using **Page / Go** can be remembered **per browser on that device**, using that browser's local storage. Reading positions are not copied to the USB library or synchronized between computers.
- **Replacing manuscripts:** Requires confirmation. The original source file remains untouched. An old imported copy is removed only when its contents can be verified as unchanged; otherwise it is retained to avoid losing data.
- **Backups and recovery:** Because the imported file is inside the novel folder, existing **writer ZIP backups** include it. The v3.9 volatile snapshot can include it subject to its **384 MiB total RAM snapshot cap**. If the app reports a partial snapshot, do not assume the manuscript was recovered.
- **Read-only means inside this application:** The viewer does not edit the imported copy. Your browser's native PDF viewer may provide its own separate download or annotation tools, but the imported USB manuscript is not modified through them.

## Visual changes and legacy compatibility

- Existing sidebar buttons, writer switching, library search, undo, character imports, galleries, relationship editing, timeline controls, ZIP backup/restore, and emergency recovery remain available.
- Relationship colors do **not** change saved relationship type names or tree metadata.
- The footer is at the **bottom of the document**, not fixed to the screen; only the top bar is sticky.
- The entire v1.0–v4.0 release history is available by clicking **Release notes** in the footer.

## QA and limitations

Automated Chromium testing with a **simulated File System Access API** passed for: writer/novel selection; v1.0–v4.0 release history display; bookshelf Manuscript button; local DOCX parsing and two-chapter navigation; PDF viewer URL/page controls; TXT import; manuscript replacement; ZIP backup containing the binary manuscript plus matching novel metadata; 27 distinct line colors and colored SVG exports; snapshot awareness of manuscript files; sticky top bar; and no unexpected JavaScript errors. A narrow-screen test found no unintended page-wide horizontal overflow.

**Not yet verified against your actual USB flash drive, production GitHub Pages deployment, or every browser's native PDF renderer.** Please test with *Test Novel* first. Preserve v3.9 for rollback and keep independent backups of your writing. The pre-existing file-conflict checks are best-effort, not operating-system file locks.

**Note:** The complete reader lives in the app, and the third-party JSZip MIT notice is included in `app.js` and `THIRD_PARTY_LICENSES.md`. No online package CDN or account is required.
