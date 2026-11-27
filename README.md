# Character Bookshelf v4.2.7 — Import Saved Maps Hotfix

**Release:** QA candidate, November 27, 2026. Full application package built from v4.2.6; no library schema migration. Keep the full v4.2.6 ZIP for rollback.

## What this fixes

**Import existing map image** in New Map accepts PNG/JPEG/WebP artwork, not an already-edited Character Bookshelf map. **Combine Annotations** only combines compatible maps already in one writer's map list. Version 4.2.6 did **not** offer a way to import a *saved editable map* from a different storage location.

This hotfix adds **Map files → Import Saved Map…** (also under the Maps toolbar menu). It reads the source as **read-only**, previews editable map files, and imports a separate copy assigned to a novel or series in the current writer. The imported copy preserves canvas, text, drawings and stamps. When the source folder contains the original image, the image is copied with SHA-256 fingerprint verification. The original map, source image, and writer folder are not modified.

## How to import a map from your other folder

1. **Back up both libraries** first. Keep the complete v4.2.6 application package for rollback. Do not delete or move the old map folder yet.
2. Publish the **entire** v4.2.7 ZIP's contents to your GitHub Pages app, not just `index.html`. Hard refresh Edge/Chrome with `Ctrl+Shift+R` and confirm the footer shows **v4.2.7**.
3. Connect your **current destination writer library** in Character Bookshelf. Open the novel or series where you want the map to appear, then select **World maps**.
4. Open the **Map files** menu at the top and choose **Import Saved Map…**.
5. Choose **Choose source folder…** and browse to the *other location's writer folder* (the folder that contains `world-maps`), or choose the `world-maps` folder itself. You may also choose the library root containing that writer folder.
6. Select the discovered map, review its annotation count, image status, title, and destination. The destination defaults to your currently open novel/series. Choose a new title if needed.
7. Click **Import independent copy**. Confirm the app says the map was imported, then inspect the map canvas, drawings, labels and original image. Check **Saved** and export a fresh writer backup.

**Alternative: single JSON file.** Use **Choose map JSON…** and select a file from the source writer's `world-maps/maps/` folder. This imports its editable annotations, but **does not** include the separate source image. If it was image-backed, the new map is marked **Unlinked**. Use **Maps → Re-link Image** to select the exact original source image; its fingerprint must match. Do not choose an exported PNG/PDF; those are flat images, not editable map files.

## Safety guarantees and limits

- **Independent copy, not merge:** Every imported map and annotation gets a new identity. An existing map with a matching title is **never overwritten** and the source is not auto-synchronized. You can rename the new copy before importing.
- **Destination:** An imported map belongs to the novel or series you explicitly select in the currently opened writer context. It never adopts the old location's novel/series IDs.
- **Source files are read-only:** Folder discovery, JSON reading, and image verification never write to the source. Source image must pass SHA-256 verification; mismatches reject the import.
- **Missing image:** Without the source image, annotations can still be imported as an Unlinked map. Normal writer ZIP backups continue to store original image files, while volatile RAM recovery continues to exclude them.
- **Interrupted import:** A failed write is not registered as a map; when safe, new unregistered staged files are removed. If the destination index cannot be verified, files are left for manual inspection rather than risk deleting data.
- **Limits:** source JSON up to 16 MiB; each source image up to 64 MiB; 500 discovered maps per folder; standard World Maps canvas and object limits still apply. Import a map **JSON** or a **folder**, not a World Maps backup ZIP. ZIP restoration is not part of this hotfix.
- **Compatibility:** Folder selection requires a supporting version of Microsoft Edge or Chrome over a secure context. This release does not address the planned mobile layout, pinch zoom, sidebar bugs, or full profile reconciliation.

## Testing performed

- **35/35 Node automated tests passed** (baseline regression suite plus map discovery, safe copies, and real SHA-256 mismatch checks).
- **Chromium DOM/browser workflow using simulated local folder handles**: complete image-backed map import; exact source-image fingerprint and name; correct object and source retention; mismatched image rejected; standalone JSON imported as Unlinked; failed destination write cleanup; destination assignment inside the integrated bookshelf iframe. No page-level JavaScript errors.
- The browser harness uses a deterministic substitute for WebCrypto hashing because this test environment cannot load a secure origin; the actual SHA-256 comparison was tested separately using native Node WebCrypto. These are **not** real USB-drive tests.
- **Not yet verified:** live GitHub Pages deployment, physical USB disconnects, Windows OS folder picker behavior, Android, high-volume real libraries, or external ZIP map restore.

## Rollback

Keep both writing libraries unchanged. To revert the application, redeploy the **complete v4.2.6 code-only package** without deleting writing files. Imported maps use the existing schema 1 World Maps storage format and should remain readable in v4.2.6. Always confirm your current maps and recent saved changes before switching versions.
