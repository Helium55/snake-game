# Changelog

All notable changes to this project should be recorded here.

## [0.2.2] - 2026-06-16

### Added

- Added a synthwave city skyline layer and brighter horizon glow behind the main menu.

### Changed

- Strengthened the synthwave perspective grid and updated the style option description to mention the skyline.

## [0.2.1] - 2026-06-16

### Fixed

- Fixed synthwave style shifting the menu and game screen off-center by preventing horizontal overflow and using column page layout.
- Made the synthwave game canvas translucent with a light blur layer so the sunset background shows through during play.

## [0.2.0] - 2026-06-16

### Added

- Added a main-menu visual style switcher.
- Added a synthwave visual style option with scanline sunset, moving horizon grid, neon UI colors, and matching canvas base color.

## [0.1.0] - 2026-06-14

Baseline version for GitHub Pages rollback points.

### Added

- Added `AGENTS.md` as the handoff guide for future AI agents.
- Added mobile A/B buttons for entering the Konami invincibility toggle.
- Added player speed slider that scales both tick speed and score gain.
- Added food merging: four adjacent same-level foods combine into one higher-level food.

### Changed

- Automation shop purchases are per-run only and reset on every new game.
- Magnet shop upgrade now has 3 levels with increasing range and no longer appears after max level.
- Optional paid shop card selection can be canceled by clicking the selected card again.
- Body compression supports body levels up to 16.
- Upgrade overlay remains scrollable on mobile.

### Fixed

- Fixed automation pathfinding keeping stale manual direction.
- Fixed automation score/body growth stalling after level 10.
- Fixed compressed-body eating not increasing body points.
- Fixed automation speed upgrades not taking effect.
- Fixed timed invincibility expiring and turning off cheat invincibility.
- Fixed speed-scaled upgrade progress blocking upgrades.
