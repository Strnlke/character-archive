# Character Bookshelf — v3.5

This release adds **Refresh view**, page-specific one-step Undo, and remembers your place after a browser reload. It keeps the same USB/flash-drive library format as v3.4. No cloud account or sign-in is required.

## Update GitHub Pages

1. Back up your USB `Character Bookshelf` (or older `Character Archive`) library before updating.
2. Extract the ZIP.
3. Upload **index.html**, **app.js**, and **styles.css** together, replacing the existing files in the same GitHub repository and folder where v3.4 currently runs.
4. Commit, confirm Pages deployment, and use Ctrl + Shift + R once to load the updated application.
5. Select your usual USB library folder. Your novel and character files are compatible; there is no data migration.

## Refresh view versus browser refresh

**Refresh view** (top-right) flushes unsaved changes first and then rereads the selected USB folder for the currently displayed page. It keeps the view (bookshelf, all characters, character tree, or profile) where possible. If the selected character or book was deleted externally, the app may show a higher-level page.

**F5 / Ctrl + R** always restarts the browser application, because Character Bookshelf is a single-page site. The app remembers the last visited view *for this browser tab only*. You must still manually reselect the USB library folder for browser security. Once selected, the app tries to restore that writer, book, and character/tree page. If you choose a different library it will not incorrectly open a page from the previous one. Browser storage restrictions may prevent this optional convenience; your actual character data remains on USB.

## Undo scope

Each writer's bookshelf, novel character gallery, novel character tree, and individual character editor has its own **one-step Undo** slot. Changes on Jim's page won't replace the one-step Undo for Jake's page. These Undo slots exist only while the application tab remains open; they are lost on F5, closing the tab, or changing the selected library. Reloading data from USB also clears affected Undo slots to avoid overwriting changes made outside the tab.

Confirmed permanent deletion is not undoable. Keep USB backups.

## Tested

- JavaScript syntax validation with Node.
- Chromium automated tests with simulated File System Access API: separate Undo for Jake and Jim, independent gallery and tree Undo, refresh-current-editor from USB without leaving the view, and restoring the current character after a simulated full app restart followed by folder selection.

The browser-level test suite uses a simulated USB drive; please verify with a copy of your real flash-drive library before relying on v3.5 for important writing.
