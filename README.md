# Character Bookshelf v3.2 — Delete with confirmation

This update adds **Delete book** (on bookshelves and inside a novel) and **Delete character** (on the character gallery and profile editor). Both actions show an **“Are you sure?”** warning with a separate **Cancel** button, and do nothing unless explicitly confirmed.

## IMPORTANT: Before upgrading

1. **Back up your USB library** to a second location first. Deleting a book permanently removes its entire novel folder, including all characters, portraits, notes, and other files inside it. Deleting a character removes that character's JSON profile and its portrait if available.
2. Extract this ZIP. Upload and replace `index.html`, `app.js`, `styles.css` in your existing GitHub Pages repository (such as `usb-test`). Commit the files. You can upload this README too.
3. Refresh with Ctrl+Shift+R. Select your existing USB library as normal. **No data migration or renaming is needed.**
4. **Try deletions with a test book and test character first**, not important writing data. The browser has to be able to delete files from your chosen USB folder.

## How to delete

- **Book:** Use the little × in a book cover's upper-right corner on the bookshelf, or **Delete book** on the novel's All Characters page. The warning says that all files inside that book's folder will be removed.
- **Character:** Use the × on a character card in All Characters, or **Delete character** in the profile editor. The warning names the character and explains that its profile and portrait will be removed.
- **Cancel, Esc, or closing the dialog:** Nothing is deleted.

If file deletion fails, the app reports failure rather than claiming success. A failed **recursive book deletion** can leave a partially deleted folder if USB access is interrupted; inspect the folder before retrying. USB file deletions generally bypass the Recycle Bin.

This version preserves the existing folder structure (including legacy `Character Archive` folders), writer profiles, novels, profile schemas, auto-save, navigation, and PDF/Word exports. Links to deleted characters in other profile JSON files may remain as invisible references; those files are not rewritten by deletion.

## Verification

Automated Chromium tests cover confirmation and cancellation, removal of character files/portraits and entire novel folders, preservation of other writers and novels, reloading from USB-like storage, and failure reporting. This build must still be verified on an actual USB flash drive in Chrome/Edge.
