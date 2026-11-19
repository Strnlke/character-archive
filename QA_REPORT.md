# Character Bookshelf v4.1.1 — QA Report

## Automated results

**64 / 64 scenario checks passed** in a Chromium browser harness using disposable, simulated File System Access API folders. No unhandled browser JavaScript errors were observed in the tested paths.

| Suite | Result | Main focus |
| --- | ---: | --- |
| v4.1 integration suite | **28 / 28** | Novel series, independent character copying, deferred tree links, explicit dates and undated timeline events, alias-based manuscript matching, RAM exclusions, search cache, tutorial controls, writer ZIP backup |
| v4.0.2 regression suite | **22 / 22** | Startup, writer and novel navigation, relationship colors, whole-word search, autosave, TXT/DOCX/PDF importing, ZIP export, simulated emergency recovery |
| Adverse-condition suite | **10 / 10** | Writer-deletion guard, malformed and canceled character imports, reviewed updates, external write conflict, failed-save readback, canceled and completed backup restore |
| Scale suite | **4 / 4** | 503-character gallery, 500-result whole-word search, shelf navigation, no JS errors |

**Scale observations:** 503-character gallery loaded in approximately **1.28 seconds**; searching the generated 500-match data took approximately **1.22 seconds** in this particular simulated Chromium run. These are not benchmarks of a physical USB flash drive.

## Illustrated tutorial verification

All **eight** referenced screenshot assets exist; images loaded with their expected dimensions in the isolated browser test. All nine navigation targets are present; tested clicking Getting Started, Timelines, Novel Series, Manuscript Reader and Backups & Recovery. No tutorial script exceptions or unintended horizontal page overflow were observed at a 390-pixel viewport. The tutorial includes a pop-out control, but **real browser pop-up permission** remains an end-user environment check.

## Data integrity checks

- Copying a character to a different linked novel generates a separate profile with a distinct ID. Source profile unchanged.
- A pending copied relationship becomes a real destination link only after the other character is copied. A manually removed destination relationship remains removed when more characters are copied.
- A repeated copy of the same provenance is blocked; same-name/unrelated profiles prompt confirmation.
- Series timeline reads source novels rather than saving duplicate events. Relative/undated events remain in a separate section with their originating book.
- Imported manuscript bytes stay **out of the emergency RAM snapshot** but **inside ordinary writer ZIP backups**.
- USB disconnection, an external profile overwrite, and a simulated readback mismatch were covered through the existing regression/failure harness.

## Limits and follow-up

1. Tests used a **simulated USB folder** in headless Chromium and synthetic novels; they are not a certification of physical USB behavior, GitHub Pages deployment, arbitrary devices or other browsers.
2. **Precise PDF character-mention indexing, highlighting and jump-to-occurrence are not implemented**. The native PDF manuscript reader remains available.
3. Complex DOCX formatting and very large real manuscripts were not exhaustively tested; the scale run stressed character JSON volumes, not tens of megabytes of full prose.
4. A read-only manuscript is still valuable data if its original is missing: it is intentionally **excluded from RAM snapshots**, so preserve original files and exported writer ZIPs.
5. An in-browser RAM snapshot cannot survive browser close/crash. External backups are necessary.
6. Test a copied library on your actual flash drive after deploying, and verify: normal saves, manual reauthorization, ZIP contents, Series copying, and recovery-to-another-folder.

**Release decision:** Automated acceptance checks passed. Suitable for controlled end-user testing with verified backups; real-hardware and live-host acceptance are still outstanding.


## v4.1.1 unified-shelf patch verification

**20 / 20 patch-specific Chromium checks passed** in a disposable, isolated browser page.
These checks are **additional** to the previous v4.1 release's 64 scenario checks;
the complete earlier suite was not rerun during this small patch.

Patch tests covered ordinary five-book shelf rows, series-member adjacency, no
series-only shelf headings, five linked labels across two series, standalone books,
accessible series button labels, correct navigation to each Series page, ordinary
novel-cover click behavior, unlinked books, a series longer than five books, and
successful series-button navigation at a mobile viewport. No uncaught browser JS
exceptions occurred in those exercised paths.

The tutorial's bookshelf screenshot was recaptured from the modified interface
using synthetic QA novels. Browser tests used DOM-injected scripts and simulated
storage; this is not a test on a physical USB drive or the deployed site.
