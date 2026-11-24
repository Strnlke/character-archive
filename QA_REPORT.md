# Character Bookshelf v4.2.0 — QA report

Baseline: actual uploaded v4.1.3 source ZIP. Status: packaged but NOT deployed, NOT tested on physical USB/Android.

## Confirmed tests
- **Original source** — Inspected exact uploaded v4.1.3 ZIP and based all changes on its full source; Release B includes Release A.
- **JavaScript static checks** — Node --check run across all application and module scripts; no syntax errors.
- **Pure data logic** — 9/9 Node unit tests passed: schema, shape templates, image-free recovery, independent copies, selected/all merges, duplicate detection, family/fingerprint restrictions, cluster count.
- **Standalone editor fixture** — Headless Chromium mocked-folder workflow: new blank map, shape, forest stamp, undo and redo, copy, combined copy, selectable merge source, annotations-only SVG export; no page errors.
- **Embedded writer fixture** — Headless Chromium same-origin simulated bridge: series editor opens, local writer folder connected without second picker, blank map with grid and shape saved, forest stamp saved, annotations-only SVG export, copy into a linked novel. Map JSON/index recorded in RAM recovery; image excluded.
- **UI refinement fixture** — Characters import popover, footer Storage Status, live topbar state and escape-to-close passed in isolated Chromium DOM test.

## Limitations
- The browser used in this test environment does not permit normal direct file://, HTTPS test-host or localhost navigation. DOM/iframe tests therefore used in-memory same-origin simulated contexts and a directory-handle mock. They are not a real-device acceptance test.
- The imported-image/relink path, PDF browser print layout, map limits, storage failure paths, orphan map relinking, full ZIP/restore and real USB disconnect/reconnect were not exhaustively exercised.
- External copyright terms remain the writer’s responsibility; users must have rights to use and reproduce underlying images.
- The pre-existing v4.1.3 75 responsive tests were not rerun as an entire regression suite. B integration regression was narrow and feature focused.
- Detailed mobile drawing and Android File System Access behavior require acceptance testing on actual hardware.
