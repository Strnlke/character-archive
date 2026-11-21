# Character Bookshelf v4.1.3 — Dedicated Mobile Update

This release is an **interface-only upgrade** to v4.1.2, delivered separately so it can be rolled back without reverting the character, manuscript, annotation and notes features added in v4.1.2.

## Install carefully

1. **Keep your original v4.1.2 ZIP.** Export a separate backup of your writer library and (ideally) copy your USB library folder to another drive.
2. Extract **every file** in this v4.1.3 release ZIP. Upload all the website files into the existing GitHub Pages repository, preserving the `tutorial-assets/` folder. Replace existing files and **add** the two new files: `mobile-v413.css` and `mobile-v413.js`.
3. Commit the deployment, open the GitHub Pages website and refresh. `index.html` uses `?v=4.1.3` cache-busting references.
4. Verify desktop and Android behavior with a disposable or backed-up library before relying on it for your real writing.
5. Rollback: replace the **entire website release** with the retained v4.1.2 files. **Do not delete or rename the USB library folder.** This update intentionally makes no data-format migrations.

## What changed

- **Mobile header:** A compact `☰ Menu` button shows all existing top-bar actions on demand; the live save and recovery status stay visible. The menu has Escape-to-close, explicit expanded state and 44px-height action targets.
- **Bookshelf:** Better spacing, narrower recent-work strip that scrolls horizontally, and book covers close to their shelf rather than separated by a large empty area. Linked books remain on the same bookshelf, not on separate series shelves.
- **Novel Characters page:** Book title uses a full-width row; the five actions sit below it in a neat grid. Sorting, Tree, Timeline, Manuscript, Novel Notes and exports align into a compact two-column grid. Character cards display in two columns.
- **Other mobile screens:** Responsive layout details for the character editor, Series page, Timeline, manuscript reader, annotations and notes controls.
- **Narrow tablets:** A dedicated 751–970px breakpoint prevents the novel heading from overflowing horizontally.
- **Tutorial:** New “Using the Mobile Layout” topic and two screenshots of the v4.1.3 interface. Accessible through the original footer Tutorial link.

## What did not change

The USB / folder selection system, storage persistence, character and novel data formats, save verification, RAM recovery, manuscript import and annotation logic, backups, search index, and desktop-specific styling all retain their v4.1.2 behavior. No JavaScript writes or data migration were introduced for mobile layout.

## Testing

See the **QA_REPORT.pdf**, readable in a normal PDF viewer, for test coverage and limitations. Automated Chromium tests passed 75 / 75 presentation and navigation checks at 320, 375, 390, 430, 768, 1024 and 1366 CSS pixels. At 1024 and 1366 pixels, screenshots of the bookshelf and novel Characters page matched the v4.1.2 reference pixel-for-pixel in the tested upper portion of each page.

**Not tested on real Android hardware or a physical USB drive in this run.** Perform a quick check on the specific browser and device you use. These virtual checks do not replace a full v4.1.2 functionality/stress regression.
