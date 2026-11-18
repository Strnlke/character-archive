# Character Bookshelf v3.7 — Character Import Review

This release adds a **review-first** JSON importer to the existing Character Bookshelf v3.6 USB application. No Microsoft accounts or cloud sign-in are required.

## What's new

- **Import character** on a novel's **All Characters** screen and **Import updates** on individual profiles.
- Accepts `.json` files exported from Character Bookshelf as well as compact `character-bookshelf-update` JSON files prepared from a conversation.
- **Existing character:** Matches in the selected novel by internal character ID or exact name. Opens a side-by-side comparison, organized into the six profile sections. **Left** is an editable draft of the existing character; **right** is a read-only proposed update, with selectable text and Copy buttons. Proposed fields are shown first, and sections with no proposed changes start collapsed.
- **No automatic merge:** Imported text NEVER replaces existing content merely because a file was opened. Copy or type only what you want into the left side. Select **Save changes to USB** to commit your reviewed draft, or **Cancel** without writing.
- **New character:** When no match is found, opens the **New Character Editor** with all six editable sections prefilled for review. No character is created until **Save new character** is selected. Cancel discards the unsaved draft.
- **Possible duplicate:** Similar names open a choice to compare with an existing profile or intentionally create a new one. The app blocks accidentally creating a second character with the exact same name in the same novel.
- **Safer saving:** Before saving an update to an existing character, the app rechecks the source file for external changes; if it changed, the import is blocked so the newer USB file is not overwritten. An existing-character import also saves a revision snapshot before writing the approved change.
- **Relationship safety:** Existing internal relationship links and portrait metadata stay untouched. Incoming relationship UUIDs from an exported file are not copied because they may point to characters in another library; relationship notes are available for manual review.

## Installation

1. Back up the entire **Character Bookshelf** folder on your flash drive to a separate location.
2. Extract the release ZIP, and upload **all three files together** — `index.html`, `app.js`, and `styles.css` — to the GitHub Pages repository currently hosting Character Bookshelf. Replace the older copies.
3. Commit, wait for the GitHub Pages deployment to succeed, then open the application and press **Ctrl + Shift + R**.
4. Open your existing USB folder, writer, and book. Click **Import character** or **Import updates** and select a `.json` file.
5. For your first test, use **a backup copy** of your library and an imported update with harmless test notes. Confirm Cancel leaves the character unchanged and Save applies only your edited fields.

The selected novel is the destination for imports. Neither the imported data nor your notes are sent to GitHub; the importer runs in your browser.

## Update file format

A proposed update can contain only the fields that are relevant. You can ask ChatGPT to create a compatible JSON file after discussing a character, **using only the story details you confirm**.

```json
{
  "format": "character-bookshelf-update",
  "version": 1,
  "character": {
    "name": "Sample Character"
  },
  "sections": {
    "background": {
      "history": "Example background text to review."
    },
    "personality": {
      "traits": "Example personality text."
    }
  }
}
```

The importer recognizes these section names and text fields:

| Section | Supported fields |
| --- | --- |
| `basic` | `fullName`, `age`, `occupation`, `appearance`, `notes` |
| `personality` | `traits`, `fears`, `beliefs`, `motivations`, `notes` |
| `background` | `history`, `experiences`, `notes` |
| `relationships` | `notes` (not imported relationship IDs) |
| `story` | `role`, `timeline`, `events`, `notes` |
| `freeform` | `notes` |

The JSON file must include a name and may include any subset of supported text fields. Missing fields are presented as **No proposed change**; they do not imply deletion. An existing complete Character Bookshelf character JSON file is also accepted. If a character name in the source does not match exactly but is close to an existing name, the app asks you to choose.

A sample file named `Example_Character_Update.json` is included for testing. It is **placeholder content**, not material for any of your novels.

## Notes and limitations

- The comparison is a **local, staged editor**: no writing to USB until you approve Save. Closing or canceling discards draft edits.
- The new-character import uses a focused full-screen editor with the same six sections; character links, portraits, and structured timeline events can be added using the regular profile and novel controls after creation.
- Import source relationships are text only; linked-character identifiers do not transfer from a different library. Timeline events in `timeline.json` are also not imported by character update files.
- The browser may ask before you leave the page if an import review is still open. Review draft contents do not survive reloading the website.
- JSON import files are limited to 1 MB; only known text fields are used. No automatic story extraction or inference takes place in Character Bookshelf.
- One-step Undo remains page-specific. Import updates create a revision snapshot for existing characters, but importing does not establish a multi-step Undo history.
- Existing writer profiles, book folders, timelines, pictures, links, and exports use the established v3.6 storage format; there is no migration.
- **Verification:** Node.js JavaScript syntax check plus automated Chromium tests with simulated USB storage passed for existing-profile import, cancel, manual editing, save, new-profile review/cancel/save, exact and similar-name duplicate checks, external-change conflict blocking, native profile import, and malformed JSON rejection. **Not yet verified on your physical USB or the deployed GitHub Pages site.**
