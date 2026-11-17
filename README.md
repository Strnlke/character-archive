# Character Bookshelf v3.6 — Timeline & Library Tools

An offline-data, static-browser application for writing reference profiles. This version preserves the existing USB folder library format and does not require Azure, Microsoft sign-in, or new accounts. The website still needs to load from GitHub Pages over HTTPS (or be served locally in a compatible secure browser context).

## What changed

**1. Character timeline**
- In **All Characters**, click **Timeline**. It is also accessible from the Character Tree and each character profile.
- Add an event directly to the timeline, or open a character profile → **Story Information** → **Timeline events** → **Add event**.
- Each event is stored once in the book's `timeline.json` file. It includes a title, optional year, optional relative/exact date text, notes, and zero or more character IDs.
- Filter the same events by individual character, or return to the novel-wide chronological view.
- Assign a year yourself, leave it undated, and change event order **within a year** with the up/down buttons or drag-and-drop. To move to another year, first edit that event's year.
- Events entered through a character profile appear on the novel timeline automatically. **Existing freeform Important Events notes are not parsed or turned into events.** The application does not infer or invent story facts.
- Timeline changes have the current page's one-step Undo. An event added from a character's profile uses that character's page-specific Undo.

**2. Universal Search**
- Use **Search library** at the top.
- Searches names, individual character fields, notes, and structured timeline event text across all novels belonging to the selected writer.
- Results open the relevant profile or timeline entry. Search reads the chosen USB library locally; no index or private writing is sent to a server.

**3. Uploaded book covers only**
- In a novel's All Characters page, click **Upload cover**. Choose JPG/PNG/WebP (10 MB maximum).
- The original image is copied into that novel's USB folder as `cover.jpg`, `cover.png`, or `cover.webp`, and referenced by its existing `novel.json` file.
- **Remove cover** restores the existing default book design. No covers are generated.

**4. Character Revision History**
- Each character profile now has a **Revision history** button.
- Character Bookshelf saves a copy of the prior on-disk JSON profile before the next edit, then no more than one automatic snapshot per 15 minutes per character. It keeps up to 12 snapshots per character in `revisions/<character-ID>/` under the novel folder.
- Preview a JSON snapshot or restore it. Restoring first backs up the current on-disk profile.
- This is not a replacement for a complete USB library backup. Deleted books and characters (and their revision folders) cannot be recovered through Undo.

**5. Character Tree export**
- In **Character Tree**, choose **PNG** to download a full image (including offscreen manually arranged cards and relationship lines).
- Choose **PDF / Print** to open a print-friendly page. Use the browser's print dialog and select **Save as PDF**. Complex or very large diagrams may be scaled to fit printed paper; use PNG for the full-resolution visual.

## Updating GitHub Pages

1. **Back up your entire existing USB library first** using **Back up library** or File Explorer. Keep that copy in a different location.
2. Extract this ZIP.
3. Replace **all three** application files (`index.html`, `app.js`, `styles.css`) in the GitHub repository and folder currently hosting Character Bookshelf. Upload the three files together; do not mix versions.
4. Commit, confirm Pages has deployed, and reload the website with **Ctrl + Shift + R**.
5. Select your USB folder again and open your existing writer/book. No file migration is required. The app continues to recognize existing `Character Archive` and `Character Bookshelf` libraries.
6. For a safe first test, use a **copy** of your USB library or an empty test location.

## Compatibility / data structure

Existing files are left in place: `character-archive-manifest.json`, writer folders, each novel's `novel.json`, `characters/`, `portraits/`, and `character-tree.json` are still supported. New data is added only when a feature is used:

```
Character Bookshelf/
  character-archive-manifest.json
  Aaron/
    Novel Title/
      novel.json
      cover.png                    (optional, uploaded image)
      timeline.json                (when the first event is saved)
      character-tree.json          (existing tree layout)
      characters/
        <character-name>--<id>.json
      portraits/
      revisions/                   (when first revision is needed)
        <character-id>/
          <timestamp>.json
```

## Tests performed

- Node 22 JavaScript syntax check.
- Headless Chromium DOM and File System Access simulations: creating writer/book/character; saving structured events from a character profile; linking a second character; filtering; assigning year; moving events with arrows and drag-and-drop; per-page undo; searching saved profile notes; uploading a PNG cover and displaying it on the bookshelf; producing revision snapshots and restoring a previous profile; creating a tree relationship; exporting a complete tree to PNG.
- Legacy-library simulation: opened a pre-v3.6 `Character Archive` folder, read a saved character, opened an empty new timeline, searched existing profile fields, and verified that no new `Character Bookshelf` folder was created.
- **Not tested on your physical USB drive or GitHub Pages deployment in this release.** Real hardware testing remains necessary before trusting valuable writing to this version.

## Limitations

- The application doesn't automatically discover removable drives. Select a folder each session, as planned.
- Character Tree export produces a visual PNG; PDF uses the browser's Print / Save as PDF workflow.
- Profile revisions are lightweight snapshots, not unlimited history or a full backup.
- One-step Undo is page-specific and session-only. Confirmed permanent deletion is not undoable.
- Avoid using the same USB library simultaneously from two computers. Always wait for **Saved to folder** before ejecting the drive.
