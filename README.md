# Character Bookshelf — Name Update (v3.1)

This release renames **Character Archive** to **Character Bookshelf**. The bookshelf, writer profiles, all-characters gallery, editor, USB autosave, and PDF/Word exports are otherwise unchanged.

## Updating your GitHub Pages app

1. Make a copy of your existing USB library before updating.
2. Extract this ZIP file.
3. In the GitHub repository that hosts your working USB app (your `usb-test` repository, if it is still your active one), replace `index.html`, `app.js`, and `styles.css` with the new files. You may also upload this README.
4. Commit and wait for GitHub Pages to finish publishing, then refresh using Ctrl+Shift+R.
5. Insert your flash drive, select its folder again, and verify your writer profiles and characters load. **Don't delete or rename your existing data folder.**

## Folder names and compatibility

- For a new empty drive/location, the app creates a folder named **Character Bookshelf**.
- Existing USB folders named **Character Archive** are automatically recognized and opened **without moving or renaming files** when you select their parent location. You can also select the existing folder directly.
- If both a `Character Bookshelf` and `Character Archive` folder are present under the selected location, the app asks you to choose the correct library folder directly instead of guessing.
- Internally, the manifest file remains `character-archive-manifest.json`, with the same JSON format. **This is intentional for compatibility**, even though the displayed app name is Character Bookshelf.

## Verification

In a simulated Chromium environment, the renamed app created the new folder, saved and reloaded a character, reopened a preexisting Character Archive library without creating a new folder, safely handled ambiguous folders, and produced Word/PDF exports with the updated app name. The updated build has not yet been tested with your physical USB drive.
