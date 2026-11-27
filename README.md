# Character Bookshelf v4.2.6 — Writer Folder Discovery Hotfix

**Release status:** Complete-source QA candidate, prepared November 27, 2026 from the original v4.2.5 full-release ZIP. **Scope:** Register/copy existing writer folders; no changes to novel/character/series/map data formats or the existing bookshelf/map interface.

## What this fixes

Older versions only displayed writers listed in `character-archive-manifest.json`. Copying an individual writer folder (for example, `claire`) into an existing Character Bookshelf library did not make it appear in the writer selection screen. This hotfix finds unregistered writer folders by their existing `novel.json` / `character-bookshelf-series.json` content, **without requiring a new writer metadata file**. It also accepts an optional `character-bookshelf-writer.json` identity file if one is already present.

The new writer selection screen includes **Find copied writer folders**, **Add writer from folder**, and a folder drop target. All three show a **review and confirm** dialog before registration. No automatic merging or overwriting is performed.

## Before installing

1. Export a writer ZIP backup of each important writer, **and copy the entire existing Character Bookshelf library** to another location. Verify the copies. Keep the complete v4.2.5 release ZIP for rollback.
2. Extract this entire v4.2.6 package and publish **all the files and subdirectories** to your GitHub Pages repository. Do not deploy just `index.html` or `app.js`.
3. Hard-refresh Edge/Chrome (`Ctrl+Shift+R`) after the site has deployed. Check the footer says **v4.2.6**.
4. Try the workflow first on a disposable library or Claire's demo before using the primary writing library.

## Add Claire's existing writer folder (easiest option)

If you already copied Claire's `claire` folder **into your current library's `Character Bookshelf` directory**, alongside your existing writer folder(s):

1. Choose/open that library in the app. On **Who's writing?**, the app scans for copied writer folders. If you already have the library open, select **Switch writer** then **Find copied writer folders**.
2. Find the result named **Claire** (expected: **30 books** when using the complete demo folder), then choose **Review & add**.
3. Confirm that the preview points to `claire`, shows the expected number of books, and that the name is **Claire**.
4. Choose **Register this writer**. This updates the library manifest only; the files inside the existing `claire` folder are not changed.
5. Claire should appear as another writer, not replace your current one.

**Important:** Copy only the **`claire` writer folder**, not Claire's whole `Character Bookshelf` folder and not Claire's `character-archive-manifest.json`. Do **not** replace your real library's manifest.

## Add Claire directly from a separate folder

If Claire's profile is still outside the active library:

1. Extract `Claire_Standalone_Demo_Library.zip` somewhere safe, leaving the `claire` folder and its book subfolders intact.
2. Open your normal Character Bookshelf library and go to **Who's writing?**.
3. Choose **Add writer from folder**, then pick the **`claire` folder itself**, or drag that folder from File Explorer into the folder drop area (in supported Chromium browsers).
4. Review the book count and writer name, then select **Copy & add writer**.
5. The app copies all files, including covers and manuscripts, into a **new** folder inside your library; the source folder stays intact. It verifies copied bytes and adds the writer to the manifest only after the copy succeeds.

Chrome/Edge File System Access support is required for folder picking. If folder dragging is unavailable, use the **Add writer from folder** button. If you have `Claire_Writer_Import.zip` instead, the existing **Backup & restore → Restore writer from ZIP** pathway is still available.

## Safety and limitations

- **No merging.** An already-used writer name must be changed before registering a separate writer. The app never reconciles conflicting changes between locations; that is a future, separate feature.
- **No overwrite.** External imports always create a new unused destination folder; copied-in writers are only registered in the manifest after review. Creating a new writer also avoids folders copied into the library but not yet registered.
- **Existing writer folders remain untouched** during registration. External sources remain untouched during copying. Interrupted external copies are removed when safe to do so; failures must be inspected if cleanup itself fails.
- Detects legacy writer folders containing one or more valid book `novel.json` files, series metadata, or a supported identity marker. An empty legacy folder with no recognizable metadata cannot be positively identified automatically.
- External folder copies are capped at 30,000 files / 512 MiB, with a depth limit; very large libraries should use established backup/restore procedures instead.
- Tested with a **mock File System Access implementation inside Chromium**, including a full 312-file Claire folder, duplicate-name rejection, and a simulated interrupted write. Physical USB permission handling, genuine desktop drag-and-drop, GitHub deployment, Android and large-disk stress are **not yet verified**.
- No changes to World Maps, mobile navigation, zoom, saved JSON schemas, manuscripts, or established backup/recovery logic. The mobile issues remain scheduled separately.

**Rollback:** Restore the previous complete v4.2.5 application release (code only); keep all your writing files and backups. A writer registered in this release appears in older versions too, because the library manifest schema is unchanged.
