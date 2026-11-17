# Character Bookshelf v3.3 — Character Tree

This version adds a visual **Character Tree** to each novel while retaining the dark bookshelf interface, per-writer folders, individual character JSON files, USB selection, deletion confirmations, and PDF/Word character exports.

## What's new

- **All Characters → Character Tree** navigation button. The tree has links back to **All Characters** and **Bookshelf**; a character's editor also has a **Character Tree** breadcrumb and sidebar button.
- Every character appears automatically, including characters without relationships. Existing linked character pairs appear automatically as connections. **No family relationship is guessed:** old untyped links are labeled *Connected (unspecified)* until you classify them.
- In **Edit connections**, add/remove links, and set the type: Connected, Parent of, Child of, Sibling, Partner/Spouse, Friend, Rival/Enemy, or Other. The type is stored in the character's existing `relationships.links` JSON, and also appears in the character profile editor.
- Parent/child generations and sibling/partner grouping influence the automatic layout. **Drag by a card's handle** to arrange the tree manually. Positions are saved in a small per-novel `character-tree.json`. **Automatic layout** resets those manual positions after confirmation.
- All connection and layout editing happens in the browser. There are **no new accounts, remote APIs, or storage dependencies**.

## Updating your working website

1. **Back up your USB writing library** (a separate USB drive is ideal) before upgrading. The version snapshot ZIP contains application files, **not** a copy of your personal writing data.
2. Extract this ZIP and upload/replace `index.html`, `app.js`, and `styles.css` **together** in the GitHub Pages repository that currently hosts your Character Bookshelf (not just the HTML file).
3. Commit, confirm GitHub Pages finished deploying, and refresh with Ctrl+Shift+R.
4. Reconnect the folder you normally use. Open a **test novel** and use **Character Tree** on the All Characters page.
5. Add two sample characters, link them, set a relationship type, drag a card, wait for **Layout saved to USB**, then close/reopen the site and select the same folder to verify persistence.

## Storage & compatibility

The existing manifest, novel folders, writer folders, portrait files, and all character JSON files remain in place. No migration or renaming is needed. The only new file is `character-tree.json`, created **inside that novel's existing folder** when a manual node position is saved or reset. Type edits/additions/removals update the relevant character's JSON file immediately. Connections shown without a type are never assumed to be family relationships.

Removing connections edits profile links, not characters. If a pair of characters was linked in both directions, their two JSON files may require separate writes; an interrupted USB connection could cause a partial update. In that case, reopen the novel and inspect both profiles before retrying. A character is never automatically deleted when removing a connection.

## Tests performed

Static JavaScript check and automated Chromium **mocked USB folder** tests covered: writer/novel/character creation; automatic display of all characters; connection creation, type changes, cancellation of removal, confirmed removal; manual drag and layout-save file creation; resetting layout; reopening a mock library and recovering the tree. The visual preview was captured from Chromium. **Real flash-drive testing of v3.3 has not yet been completed.**

## Version snapshots

Separate snapshot archive contains the exact prior v3.2 ZIP and this v3.3 release, plus screenshots and a change log. Save future release ZIP files together so you can restore a known-working version without affecting the USB writing data.
