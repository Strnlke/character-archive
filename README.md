# Character Bookshelf v3.4 — Connection Lines + One-Step Undo

This is an update to the existing, tested GitHub Pages + manually selected USB-folder application. The site remains a local-file editor; no cloud authentication, servers, or API keys are required for the data.

## What changed

- **Clear connecting lines:** Relationships now have brighter, thicker SVG connectors with readable labels and a faint highlight behind each line. Lines redraw as you move cards.
- **More relationship choices:** Includes **Ex-spouse**, **Ex-partner**, engaged/fiancé(e), dating, extended/step/adoptive family, friends, allies, mentor/student, estranged, coworkers, and the original types. No story facts are invented or assigned automatically.
- **Connect many characters in one action:** At the bottom of the tree, choose a source, check as many target characters as you want, choose a relationship type, and click **Link selected**. There is no fixed application-imposed limit on the number of distinct character links; performance still depends on browser and hardware. A pair of characters still has one displayed connection type. You can edit its type afterward.
- **Drag to link:** Grab a card by its existing drag handle and drop it over another card. A confirmation dialog asks which relationship to assign. The moved card returns to its original location to prevent overlapping cards. Choosing Cancel does nothing.
- **Global one-step Undo:** A top-bar Undo button is shown in every view. It can reverse the most recent supported change in the current writer/novel, including a field editing session, creating a writer/book/character, editing links, a multi-link batch, moving a card, and resetting the tree layout. The button operates on **one action only**, not full history. An editing session (typing in a field without leaving it) is one action. **Confirmed permanent file deletions are not reversible** and clear Undo. Reopening the browser, changing folders or switching writer/novel clears Undo as well. Undo is not a substitute for a backup.
- **Versioned assets:** `app.js` and `styles.css` use a `?v=3.4` cache-buster to prevent the browser from mixing files across versions.
- PDF and Word character exports, the bookshelf, individual JSON files, portraits, linked profile notes, and all previous navigational controls are retained.

## Installation

1. **Back up the entire Character Bookshelf / Character Archive USB library to another drive first.** This application download contains no personal character data.
2. Keep a copy of the previous version ZIP in case you want to revert.
3. Extract this ZIP. In your existing GitHub Pages repository, **replace all three application files together:** `index.html`, `app.js`, and `styles.css`. Upload the files, not the ZIP.
4. Commit changes and check the GitHub Pages deployment. Refresh the page with **Ctrl+Shift+R**.
5. Use your **test novel** first. Reopen the USB folder, try two new connections, a multi-target batch, drag-to-link, and Undo. Close/reopen the site and check that saved relationships remain.

## Data compatibility

No migration is needed. This release uses the existing per-writer/per-novel folder layout, character JSON profiles, and `character-tree.json` position file. It also recognizes older `Character Archive` USB library folders. Additional relationship names are saved as strings in existing `relationships.links[*].type` fields. The v3.3 app will display unknown new types as 'Connected (unspecified)', so the recommended rollback is to use v3.4 or keep a complete USB backup.

## Tested

The JavaScript passed `node --check`. Chromium automated tests using a **mock File System Access API** covered: creating writer/book/characters; linking three targets in one batch; three visible SVG lines; undoing the batch and confirming saved JSON reverted; undoing drag positions; changing to Ex-spouse and undoing; text-field edits and undo; dragging one card onto another and confirming the modal; and reopening the library to confirm relationships survived. The image preview was captured from the Chromium run. **The new version has not yet been tested with a physical USB drive; verify it on an expendable test library before using your manuscript data.**

## Safety notes

- If you see **Save failed**, keep the browser tab open and reconnect the drive before proceeding.
- Browser and OS restrictions still apply. Use a recent desktop Chrome or Edge via HTTPS GitHub Pages.
- Relationship edits to multiple reciprocal profile files are not transactional; if the USB is unplugged mid-save, reopen the novel and inspect both profiles before retrying.
- Character and book **Delete** buttons still show their separate “Are you sure?” warning. These confirmed deletions cannot be undone by the new one-step Undo button.
