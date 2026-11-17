# Character Archive v3 — USB library, bookshelf, and exports

A dark-themed character manager hosted on GitHub Pages. Profiles are stored as separate JSON files in a USB folder that you select when opening the app. No cloud sign-in, server-side storage, or subscription is involved.

## New startup behavior

1. Insert the USB drive and open Character Archive in **desktop Edge or Chrome** using your HTTPS GitHub Pages URL.
2. Click **Select location** and choose the flash drive itself (or any parent folder on it).
3. Character Archive will create or reuse a folder named **Character Archive** in that location.
4. Select or create a writer, such as Aaron or Lindsay. Each writer's books and characters live in that writer's folder.
5. Every time you reopen the website, you select the drive/folder again. The app intentionally does **not** silently reconnect.

Example:

```text
USB DRIVE/
└── Character Archive/
    ├── character-archive-manifest.json
    ├── Aaron/
    │   ├── Don't Wake the Girls/
    │   │   ├── novel.json
    │   │   ├── characters/
    │   │   │   └── Jake--<unique-id>.json
    │   │   └── portraits/
    │   └── Stern Lake/
    └── Lindsay/
        └── (her novels, character files, portraits)
```

### Existing libraries are preserved

**If you directly select your existing library folder containing `character-archive-manifest.json`, the app opens it exactly as-is.** It does **not** create `Character Archive/Character Archive` or move, delete, or rename existing JSON files. If you select the parent of an already-named `Character Archive` folder, the app reuses that existing folder.

If your old library is stored directly in the root of a flash drive, the app opens that old layout without moving it. To reorganize under `Character Archive/`, first back up the library, then manually move the old manifest and each writer folder together into a newly created `Character Archive` folder using Windows File Explorer. Do not leave the manifest behind or move writer folders separately.

If an existing folder named `Character Archive` contains content but no valid manifest, the app refuses to initialize it automatically to avoid overwriting/confusing other files.

## Navigation

- **Bookshelf:** Full-width book covers, no redundant sidebar; **Switch writer** is in the top bar.
- **All Characters:** Full-width character cards and a back-to-bookshelf link.
- **Character Profile:** The dark sidebar is a table of contents for jumping between the six character sections. It also provides one-character exports and links back to All Characters or the Bookshelf.
- **Current novel exports:** On the All Characters page, use **Export PDF** or **Export Word** to export all characters in one document.

## Exports

- **PDF (single character or whole novel):** Opens a clean printable document in a new browser tab, then invokes the browser Print dialog. Choose **Save as PDF** as the destination. Your browser may ask you to allow pop-ups on your site.
- **Word (single character or whole novel):** Downloads an editable `.docx` file. No Word installation is required to create it, but Word or a compatible editor is needed to open/edit it. Optional portraits are included when the source image can be read.
- Export files go wherever the browser downloads them, or the print dialog saves them. The editable source JSON files stay on the USB drive and are not changed by exporting.
- **Back up library** still copies the whole library (writers, characters, portraits) to a separate folder that you choose.

## Update your GitHub Pages app

1. **Back up your working USB library first** using Windows File Explorer (copy the folder containing `character-archive-manifest.json` to a second location).
2. Extract this ZIP.
3. Open the GitHub repository hosting your current USB app (previously `usb-test`).
4. Replace the repository root's **`index.html`, `app.js`, `styles.css`** with the new versions and commit. You can upload `README.md` too.
5. When GitHub Pages has deployed, refresh your website with Ctrl+Shift+R.
6. For the first test, select a **new empty test location** on the flash drive. Verify that Character Archive creates a named folder and that a sample writer/novel/character survives closing and reopening.
7. Only then select your existing live library. Don't upload your writer data or character JSON files to the public GitHub repository.

## Browser and save safety

- Use desktop Edge or Chrome on an HTTPS GitHub Pages site or localhost. The browser File System Access API requires a secure context and user-initiated folder selection.
- The application does not scan USB drives automatically; you choose the location.
- Wait until **Saved to folder** before closing the page or unplugging the drive.
- On a write error, use **Retry save** or **Download unsaved profile**.
- Writer profiles are organizational, not password-protected. Anyone with access to the USB files can read them.

## Verification

In a simulated Chromium File System Access test, this version created the named application folder and a writer/novel/character hierarchy, saved and reloaded character details, reused an existing library without nesting, navigated between the bookshelf/gallery/editor, generated Word downloads for an individual character and a whole novel, and generated a print-ready character PDF. Sample `.docx` exports were reopened with a document reader and rendered to visually inspected pages. No real USB-drive testing has yet been performed on **this updated v3 build**; your previous version passed that real-device test.
