# Character Bookshelf v4.2.6 — QA Report

**Build:** v4.2.6 Writer Folder Discovery Hotfix, derived from the complete v4.2.5 ZIP. **Prepared/tested:** November 27, 2026. **Status:** Tested QA candidate; not deployed or verified on physical storage.

## Intended changes

- Detect legitimate writer folders copied directly into the existing library, even when they have no independent writer identity file. Do not auto-register on detection; show review/confirmation.
- Add a browser folder picker and File System Access drag/drop for importing a writer from another location into a new folder, retaining all nested files and original source.
- Avoid overwriting, merging, or altering registered writers. Reject collisions and changed manifest state; check new writer folder creation against unregistered folders physically present on disk.
- Preserve existing JSON schemas, recovery/backup controls, mobile design, bookshelf styling and World Maps behavior.

## Tests actually run

| Test | Result | Evidence/limits |
|---|---|---|
| Node regression suite, including map parser/startup and cover/spine behavior | **30/30 PASS** | Node `node --test tests/*.test.mjs` |
| Browser application bootstrap | **PASS** | Chromium, scripts loaded inline in restricted test harness; no observed page errors |
| Scan full Claire folder copied into an existing library | **PASS** | Real Claire demo data: 30 books plus series; detected without writer marker |
| Review/approve and register copied Claire folder | **PASS** | Writer appears with 30 books; manifest gained one writer; original Claire file entries untouched |
| Prevent repeat detection of registered writer | **PASS** | Subsequent scan returned no unregistered writer |
| Duplicate writer name | **PASS** | Refused registration without changing manifest |
| Add external one-book writer from folder | **PASS** | Source retained; new destination created; writer registered after copying |
| Copy full Claire writer folder from external source | **PASS** | 312 files copied and per-file bytes verified; imported writer opened with 30 books |
| Folder drop handler | **PASS in simulated event** | Drop event with provided directory handle opened review; genuine OS gesture not tested |
| Interrupted external copy | **PASS** | Simulated failed `novel.json` write; unregistered partial destination removed, manifest unchanged |
| JavaScript syntax and HTML ID uniqueness | **PASS** | Node syntax check; no duplicate HTML IDs |
| Genuine Chrome/Edge USB permission prompts and physical flash drive | **NOT RUN** | Requires acceptance on user hardware |
| Live GitHub Pages, genuine Explorer folder-drag gesture, Android | **NOT RUN** | Deployment/device tests outstanding |
| Full backup/restore stress, application World Maps gestures and mobile defects | **NOT RE-RUN** | Code paths not changed; previous regression tests retained |

## Important caveats

- Chromium tests used a **simulated File System Access API** with byte content from the genuine Claire demo ZIP. They do not prove real Windows/USB permissions or write failure handling on a physical removable drive.
- The simulated error check verified cleanup in the tested case. On a real device, an interrupted cleanup could leave a partial folder requiring manual inspection; the UI warns if this occurs.
- Folder import cannot detect an **empty legacy writer folder** that contains no books, series data, or identity marker. It also does not reconcile two independent edited copies of a writer.
- No direct data migration was performed. In-place import only adds a manifest entry. External import copies file bytes to a new folder and registers it after checking the copy.

## Manual acceptance checklist

1. Back up the full writing library and export a writer ZIP; retain the v4.2.5 full package for rollback.
2. Publish v4.2.6, hard-refresh and confirm v4.2.6 footer.
3. On a disposable library containing one established writer, copy the `claire` folder from the standalone Claire demo ZIP into the **existing library root** (without copying the demo manifest). Open or switch to the writer selection step and click **Find copied writer folders**.
4. Review the detected **Claire · 30 books** row, register it, open Claire and verify covers, characters, series and manuscripts. Confirm the original existing writer remains available.
5. Separately test **Add writer from folder**, select an external folder and verify the source is retained. Optionally test OS folder drag/drop on supported desktop Chromium.
6. Reopen your original writer and World Maps, back up the library again, and verify saved data in the backup before relying on the hotfix.

**Conclusion:** Core recognition, in-place registration, external copying, collision prevention and simulated interruption recovery passed. This remains a candidate pending live-site and physical storage acceptance.
