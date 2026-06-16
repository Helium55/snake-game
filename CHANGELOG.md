# Changelog

All notable changes to this project should be recorded here.

## [0.3.0] - 2026-06-16

### Added

- Added the unified Precision Control Console frontend style.
- Added distinct canvas visuals for snake segments, compressed body levels, normal food, merged food, and special food.
- Added local feedback animations for score increases, eating, food merging, and upgrade selection.

### Changed

- Reworked the default, synthwave, and acid styles to share one component system and responsive layout.
- Reworked the upgrade overlay, automation shop, speed control, and mobile controls for clearer hierarchy and touch feedback.

## [0.2.7] - 2026-06-16

### Changed

- Improved manual control responsiveness by queuing quick direction changes and accelerating the next pending game tick after input.
- Made mobile swipe controls turn during `touchmove` once the gesture crosses the movement threshold instead of waiting for `touchend`.

## [0.2.6] - 2026-06-16

### Added

- Added an acid art visual style option with neon checker patterns, halftone noise, warped color layers, matching UI shadows, and a translucent acid canvas background.

## [0.2.5] - 2026-06-16

### Changed

- Changed the synthwave sunset animation to pulse the sun glow while keeping the scanline cuts fixed.
- Raised the synthwave perspective grid back into the visible bottom area while preserving its drift animation.

## [0.2.4] - 2026-06-16

### Changed

- Removed the synthwave building and skyline layers.
- Moved the synthwave perspective grid down to the bottom of the screen while keeping its drift animation.
- Restored the synthwave sunset scanline animation with a short alternate loop to avoid visible jumps.
- Updated the synthwave style option description to match the current look.

## [0.2.3] - 2026-06-16

### Changed

- Enlarged the synthwave perspective grid so it occupies more of the lower viewport.
- Added left and right perspective building layers with neon window detail.

### Fixed

- Removed the looping sun scanline animation that made the top sunset band appear to jump.

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
