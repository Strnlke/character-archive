# Character Bookshelf v4.1.2 — Character Development & Manuscript Notes

Character Bookshelf is a local writing-reference web app. Data remains in the browser-authorized folder (usually a USB drive); there is no automatic cloud sync. This package upgrades the tested v4.1.1 source without moving or renaming a user's existing library folders.

## Install and rollback safely

1. **Back up the working library first.** Export a writer ZIP and copy the entire USB folder to independent storage. Keep the known-working v4.1.1 website release ZIP.
2. Extract the entire v4.1.2 ZIP and upload all supplied application files to your existing GitHub Pages repository. In addition to the prior files, **`features-v412.js` is new and required**. Replace the complete `tutorial-assets/` directory as well.
3. Commit and refresh the page after the new files deploy. HTML references `?v=4.1.2` to avoid stale cached JS/CSS.
4. **Test with a disposable copy of the library first**: open a novel, make a character edit, save and restore a ZIP, then import a sample manuscript and add a note. Only use the real library when the site's behavior is verified.
5. For a code rollback, restore all files from the v4.1.1 ZIP together. v4.1.1 will ignore newer sidecar note files and newly added fields, rather than deleting them. It will *not* show or edit v4.1.2-only data. Back up all data before switching versions.

## The six new feature areas

**1. Character prompts and freeform arcs.** Newly created profiles receive general-purpose Lie, Truth, Want, Need, Formative Experience and Starting Circumstances prompts. Existing characters keep their previous Beliefs, Motivations and Significant Experiences fields. Both receive an optional, blank Character Arc Type field; the app supplies no arc-method descriptions. Imported legacy JSON continues to use its historical prompts to avoid hiding imported answers.

**2. Drag-and-drop imports.** Import manuscripts by dropping PDF, DOCX or TXT into the Manuscript page, or use the original file picker. Drag character JSON onto the Character Gallery or use Import Character. Both routes call the same existing validation, replacement confirmation, comparison and duplicate-review workflows. Only one file is accepted per drop.

**3. RAM snapshot size.** A compact indicator in the top bar displays current volatile RAM snapshot use (MiB / 384 MiB). Storage Status continues showing detailed counts, completeness and errors. Manuscript reference copies remain excluded from RAM recovery.

**4. Manuscript annotations and printable export.** Save Passage Notes anchored to selected TXT/DOCX text (one paragraph at a time), or Chapter Notes. PDFs support manually identified page notes. Notes are stored in `manuscript-annotations.json` in the novel folder and never modify a source manuscript. When the manuscript is replaced, matching uses selected text, context and chapter; ambiguous matches require review and missing passages stay unlinked. TXT/DOCX annotated exports open a printable copy with notes alongside paragraphs; select Print → Save as PDF in the browser. **For PDF imports, the current native browser viewer cannot print original PDF pages with side annotations; this version provides a separate notes-only print report, not a merged annotated PDF.** Never rely on passage matching to be perfect after heavy revisions; inspect proposed matches.

**5. Novel-wide notes.** A Novel Notes page (from the character gallery) stores freeform notes in `novel-notes.json` for each novel. Notes are indexed by writer-wide search. Use Save Changes to commit edits. Concurrent external edits are detected instead of overwritten.

**6. Character tags and gallery filtering.** Add optional comma-separated tags in Basic Information. Filter the novel's character gallery by tag; tags are included in character data, character exports, writer-wide search and backups.

**Also:** Click a book title on its Characters page to rename it in place, without changing its ID/folder/series position. Consistent desktop alignment for the Series/New Novel and novel action buttons. The mobile redesign is deliberately **not included** in this release.

## Safety and known limitations

- Novel and annotation JSON sidecars are included automatically in writer ZIP backups and the RAM snapshot. Imported PDF/DOCX/TXT manuscript bytes remain excluded from RAM recovery. The snapshot disappears when the browser closes or reloads.
- Notes anchor conservatively to text. Repeated passages and major rewrites may need manual reattachment. PDF page notes require manual review if pagination changes. DOCX text rendering does not preserve all complex Word formatting or graphics.
- DOCX/TXT margin-note export relies on the browser Print → Save as PDF workflow; it is not a separately generated PDF download. Pop-up blockers can prevent the print window; allow pop-ups for the Pages site.
- Character JSON import reviews remain manual, and the writer's selected folder is the only source of truth.
- Browser filesystem permissions depend on the browser; test physical USB access independently. Desktop layout has been regression-tested; a larger mobile interface redesign is reserved for a separate release.
- The bundled JSZip library retains its MIT notices in `app.js` and `THIRD_PARTY_LICENSES.md`.

See `QA_REPORT.md` for what was and was not tested, `RELEASE_HISTORY.md` for older releases, and the **Tutorial** footer link inside the application for step-by-step screenshots.
