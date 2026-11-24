# Character Bookshelf v4.2.4 — Bookshelf Readability & Stamp Controls

**Status:** Complete-source QA candidate based on v4.2.3, prepared November 24, 2026. This is an interface/interaction update, **not a change to your writing-library schema**. No deployment or live writer-data modification was performed by the developer.

## What's new

**Cover View**
- A small consistent-height title ribbon above each cover displays a readable, standard-font title. Long titles are clipped after two lines and are available in full from a tooltip. The original uploaded cover image remains unchanged.
- A modest minimum cover width avoids squeezing words into illegibly tiny faces. The bookshelf still adapts to collection size and screen width, with series order preserved.

**Spine View**
- Every spine displays its title vertically, including books with uploaded cover art. The uploaded cover remains intact and visible in Cover View, but its rasterized horizontal wording is not reused for the spine.
- Full-title previews: hover with a mouse (brief delay), focus using the keyboard, or long-press on touch. A touch long-press previews the title without opening the novel.

**World Maps**
- A compact stamp-adjustment popover appears near the toolbar **only when a stamp is selected** by double-click. Controls: decrease size, exact current scale, increase size, rotate.
- The popover overlays the workspace and does not add a toolbar row, resize the map, pan it, or change the zoom.
- Deselecting the stamp hides the popover. The Object menu, Ctrl+C/V/D, Undo/Redo, pan, wheel zoom, persistent Fit to Screen, text editing and export still work as in v4.2.3.

## Installation and rollback

1. **Back up first:** Create a full writer ZIP backup from your running Character Bookshelf, and separately copy your entire selected local writing-library folder. Keep the full v4.2.3 release ZIP as the known-good rollback candidate.
2. Extract the entire **v4.2.4 full-release ZIP**. Upload **all extracted files and directories** to the existing GitHub Pages repository at the same relative paths. Do not upload only one edited JS file, and do not upload the ZIP as the web application.
3. After publication, hard-refresh Chrome or Edge (Ctrl+Shift+R). Confirm the footer shows **v4.2.4**. If the previous interface persists, check GitHub Pages publication, the new `bookshelf-v424.css` file, and browser caches.
4. Open a disposable writer library (for example Claire's 30-book demo). Check Cover View and Spine View, hover and keyboard focus on several short and long book titles, and the series badge, manuscript button and delete control. Verify uploaded cover artwork remains visible in Cover View.
5. In a disposable World Map, double-click a stamp. Confirm the contextual size popover appears. Resize up then down; inspect position, camera view, and Undo. Click empty space and confirm it disappears. Select a text label and confirm stamp controls stay hidden.
6. Only after those checks, use your normal library. Keep your data copy separate from the GitHub application source files.

**Rollback:** Re-publish the complete known-good v4.2.3 package. The new release does not migrate or rename writer, character, manuscript, series or map files. Reverting source files does not replace your data backups.

## Data safety and browser boundaries

- Character Bookshelf retains local-folder ownership; GitHub Pages hosts application code only, never library files.
- No novel, character, series or World Map JSON schema was changed; there is no automatic merge, migration or overwriting of map files.
- Original map images remain separate from editable annotations. Full writer backups include source images subject to existing scan limits; volatile RAM recovery excludes imported source image bytes and retains map metadata/annotation data, subject to the existing recovery limits.
- Temporary recovery usage is still displayed in decimal **MB**, not a permanent backup.
- Browser tests used **simulated writer folders** and a managed isolated Chromium environment. They do not certify physical USB/Android behavior, unsupported browsers, complex real libraries, or a live GitHub Pages deployment. Run the acceptance checklist before relying on this update.

The package includes the full source, tutorials/screenshots, `RELEASE_HISTORY.md`, `FILE_MANIFEST.md`, `QA_REPORT.md`, `QA_REPORT.pdf`, and updated Project Knowledge Guide. See the report for exact tests and unverified areas.
