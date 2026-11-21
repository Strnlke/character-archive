# Character Bookshelf v4.1.2 — Stability and Release QA

## Result

**39/39 checks passed in an isolated Chromium browser simulation** with **zero uncaught JavaScript errors** in that suite. JavaScript syntax checks passed for all four source scripts. The tutorial has **11 functional navigation topics** and **11 verified screenshot references**; its topic navigation was exercised at desktop and phone-sized viewport widths.

This is a meaningful functional test result, **not certification of zero bugs**. The browser environment blocked requests to local test URLs, so the automated suite loaded the same release HTML/CSS/JS into an isolated page with in-memory substitutes for the browser's local file handles. The deployed GitHub Pages site, production USB flash drives, real-world storage permission prompts, complex DOCX files, multi-hundred-page PDFs, printing on all browsers, and Android devices **were not tested for this release**.

## Checks performed

- Legacy novel and character data still open; original Beliefs prompts remain on existing characters. New characters get Lie, Truth, Want, Need and starting-circumstances fields. Both kinds receive a freeform arc field.
- Novel title changes in place while retaining the existing storage-folder name.
- Desktop novel action buttons align; novel data remains accessible.
- General novel notes save as standalone JSON; note edits are guarded against external file conflicts; writer-wide search finds note content.
- Character tags save, appear as available filter choices, and filter the gallery correctly.
- DOCX/TXT passage and chapter notes save with location metadata, survive a manuscript replacement, relocate when exact unique text moves, and become safely unlinked when source text disappears.
- Ambiguous repeated text is flagged for review, not silently reattached to an arbitrary occurrence.
- Native PDF notes support page anchoring and a truthful **notes-only** printable report; no false claim is made that original PDF pages are embedded in it.
- TXT/DOCX annotated print export opens a separate printable document containing manuscript paragraphs and side notes, without altering the original stored manuscript.
- Dragged-in manuscripts use the existing replacement flow. Dragged-in character JSON opens the existing compare/review flow, and cancel leaves the character count unchanged.
- The RAM recovery snapshot contains note JSON but excludes imported manuscript-reference bytes.
- No uncaught JavaScript errors during the primary 39-test sequence.
- Tutorial topic links worked in isolated Chromium at desktop and narrow viewport widths. All screenshot files referenced by the tutorial exist.

## Known limitations / release cautions

1. **Native PDF viewer:** Passage selection and precise in-document highlighting are not available for PDF, and annotated export of actual PDF pages is not supported. PDF manuscripts can have page notes and a separate notes-only print report.
2. **TXT/DOCX export:** The “Export annotated PDF” action opens a *printable HTML view*, where the writer chooses their browser's **Print → Save as PDF**. It does not automatically produce a PDF file. Pop-up blocking may prevent the new tab.
3. **Anchor stability:** Automatic reattachment can never guarantee success across substantial rewrites, repeated phrases, or structural differences in extracted DOCX text. The app retains unmatched notes; verify the proposed locations when changing drafts.
4. **USB and browsers:** The library is controlled by the browser's File System Access permissions. The application was not tested on the user's physical USB drive or on the live hosting domain in this session. Test on disposable folders first, especially backup, recovery, and permission failures.
5. **Mobile:** Only limited layout smoke checks were performed. A dedicated phone-layout redesign is deliberately excluded from this release and is planned separately so it can be rolled back without losing unrelated features.
6. **Backwards compatibility:** v4.1.1 will ignore the additional sidecar note files and new character fields, but will not display or edit v4.1.2-only data. Always back up the library before deploying or rolling back. The existing v4.1.1 series/restore test suite was not rerun in full after these additive changes.
7. **Recovery isn't backup:** The snapshot is volatile, has size and file-count limits, may be partial, and does not retain imported manuscripts. Keep independent writer ZIPs and original writing documents.

## Release recommendation

The package passed its scoped simulated QA and is suitable for **careful testing using a disposable library**. Do not replace a known-good copy or rely on it as the sole repository of notes until the writer ZIP and emergency recovery have been verified on actual hardware. Record any failures and preserve the old release ZIP for rollback.
