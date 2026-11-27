# Character Bookshelf Project Knowledge — v4.2.8

**Current QA candidate:** v4.2.8, November 27, 2026. This is a focused bug-fix release based on v4.2.7.

## Fix

- The Cancel button in the Import Saved Map modal was unable to close the form with unsatisfied required inputs, particularly while the source selection fields were hidden.
- `world-maps.html`: `#import-map-cancel` is now `type=button`, rather than a submit control, and the corresponding handler explicitly closes the dialog.
- `world-maps.js`: closes through the native dialog API, independent of validation. No map import operation is cancelled mid-write.
- Host/app cache version updated to 4.2.8; release notes and tutorial updated.

## Retained baseline

All v4.2.7 World Maps import, v4.2.6 writer-folder discovery, v4.2.5 covers, v4.2.4 stamp controls, and earlier storage/recovery behavior are otherwise unchanged. No library schema migration.

## Pending items

Mobile sidebar visibility, pinch zoom and responsive layout, profile reconciliation, independent archive converter, public PWA update preferences and separate maintenance tracks remain planned, not implemented by this hotfix.
