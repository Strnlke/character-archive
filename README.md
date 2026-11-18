# Character Bookshelf v3.9 — Storage Reliability & Recovery

**Version:** 3.9. This is a drop-in application update for the v3.8 GitHub Pages deployment. It does **not** migrate or intentionally modify your existing writer, novel, character, or revision schemas. Your character library remains on your selected USB drive/folder.

## What is new

### Writer management

- **Create Writer** no longer suggests example names.
- **Delete Writer** is available next to each writer on the writer-selection page. It explains that the *entire writer folder* (including all books, portraits, timelines, trees, and revision files) will be permanently removed. You must type the writer's exact name before the Delete button becomes available. There is no Undo. Export a backup first.

### Safer writes and conflict checks

- After a write, Character Bookshelf reads the file back and checks that every byte matches what it intended to save. A successful read-back check does **not** guarantee a flash drive cannot fail later, so keep separate backups.
- For known files in its snapshot, the app checks whether the on-disk version changed unexpectedly before writing. If it detects a conflict it **refuses to overwrite** and keeps the attempted changes available for emergency recovery. This is a best-effort check, **not an operating-system file lock**: two simultaneous writers can still race between checking and writing.
- The Storage Status panel in the top bar shows the last verified write, pending file writes, memory snapshot completeness, and the last storage error.

### In-app Refresh View recovers storage errors

- The existing **Refresh View** button retries pending profile and tree saves, attempts other retained failed file writes, and then reloads the selected view **only after these attempts succeed**.
- If storage remains inaccessible, permission cannot be granted, or a conflict prevents safe saving, Refresh View offers **Save to another location**. Pending edits are not discarded just to refresh the UI.
- If access has changed, Chrome or Edge may require you to grant permission again.

### Volatile RAM snapshot

- Upon choosing a library the app attempts to read all accessible files under that **Character Bookshelf library folder** into **RAM only**, including all writers. The RAM snapshot is updated after the app successfully writes files and it is reconciled after a successful in-app Refresh View.
- **F5, browser reload, closing the tab, browser crash, or computer restart destroys this RAM snapshot.** Do not use F5 to recover a disconnected drive. Use the app's **Refresh View** instead.
- Snapshot safety cap: **384 MiB / 20,000 files**. If the snapshot cannot be completed (for example a file becomes inaccessible or the limit is reached), the Storage Status panel labels it **Partial**. Large libraries may use considerable browser memory.
- The snapshot contains the last data the app successfully accessed. It cannot rescue files never read into memory, nor changes made to a different copy of the library without the app seeing them. It is **not** a permanent backup.

### Save to another location and recovery report

1. Keep the current page open. Click the app's **Refresh View** button.
2. If recovery is offered, select **Save to another location** and pick **a different drive or safe folder**.
3. The app makes a **new uniquely named** `Character Bookshelf Recovery ...` subfolder; it does **not** overwrite an existing writer or your original USB folder.
4. If the whole library snapshot is complete, it recovers all writers and overlays pending edits. If incomplete, it tries to save **only the currently selected writer** from available memory and explicitly labels the result **PARTIAL RECOVERY**.
5. Review the recovery result and optionally select **Download recovery report** (JSON). It records writer names, file counts, pending writes included, and any copy errors. It can report missing/inaccessible data only when the app knows it is missing; never assume an unlisted file was recovered.
6. On a successful copy, you can select **Open recovered copy** to work in that separate location. Your original USB library is not altered by this switch.

If an emergency copy is interrupted, its destination folder may be incomplete. Inspect the report and the destination before relying on it. Avoid selecting the failing original drive as the recovery destination.

### Configurable backup reminders

- In **Storage status**, choose Never, 1, 7, 14, or 30 days (default **7 days**).
- Reminders apply to the currently selected writer. The app records when a writer ZIP **download was initiated**, not when the ZIP was successfully moved to an external backup drive.
- Reminder preferences and download timestamps are stored in **that browser's localStorage**, *not* on the USB. This is separate from the volatile library snapshot. Different computers/browsers have independent reminders.

## Upgrading from v3.8

1. **First copy your entire current `Character Bookshelf` USB folder to a different physical location.**
2. Extract `Character_Bookshelf_v3_9_Release.zip`.
3. Replace **all three GitHub repository files together**: `index.html`, `app.js`, `styles.css` (from the package). Keep the JSON library on the USB where it already is.
4. Commit and let GitHub Pages finish deploying.
5. In Chrome/Edge, refresh the website with **Ctrl + Shift + R** to load the newly deployed code; reconnect the USB library using Select location. **F5 or Ctrl + Shift + R destroys an existing in-memory snapshot, so do not do this during a storage incident.**
6. Begin in your **Test Novel** or copied test library. Test writer creation/deletion only with disposable data; test storage recovery with a copied library first.

The package also includes `Example_Character_Update.json`, retained from v3.8.

## Suggested QA checklist

- Create a disposable writer: the prompt has no example names.
- On the writer-selection page, open Delete Writer, verify the confirmation stays disabled until its exact name is typed, and cancel once before testing a real deletion of a disposable writer.
- Edit a test character. Confirm its status reaches **Saved**, and that Storage Status reports a verified write.
- Use the **in-app Refresh View** without unplugging anything and confirm that your character data remains intact.
- On a **copied test library only**, simulate interrupted access, try Refresh View, save to a *different* location, and inspect the resulting files and recovery report.
- Open the new recovered copy and check that the character files are readable. Check that the original library was not overwritten.
- Export a writer ZIP from Backup & Restore; independently check that it has the expected books and characters.
- Confirm your existing character import comparison and revision-history workflows still work.

## Verification and limitations

Automated Chromium tests in a **mock File System Access environment** passed for: a complete initial RAM snapshot; normal verified character saves; prevention of overwriting an externally edited file; Refresh View offering recovery after conflicts and disconnected storage; emergency copying all available writers; partial recovery of the selected writer; opening and editing the recovered copy; deliberately corrupted write read-back detection; permanent writer deletion with typed-name confirmation; new writer creation; existing-character import comparison; new-character import; and v3.8 ZIP export.

**Not tested on your real physical USB drive or your deployed GitHub Pages site.** Browser permission prompts, OS-level removable media behavior, power failures, and race conditions can differ from the mock. Treat this release as a QA candidate until you've tested it on a disposable library. Never rely solely on RAM snapshots or recovery mode for safeguarding irreplaceable manuscripts.

The app does not access files outside the Character Bookshelf directory selected by the user and does not transmit library contents to a server.
