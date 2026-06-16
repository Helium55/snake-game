# Square Module Control Console Redesign Design

Date: 2026-06-16

## Goal

Redesign the game frontend again around a more restrained, high-end technical control-console style. The design should feel like a professional instrument panel rather than a neon game skin.

The approved direction is:

- High-end research instrument plus tactical control console.
- Clear visual hierarchy and responsive layout.
- Refined microinteractions and hover/touch feedback.
- Minimal heavy gradients and no generic AI-style decoration.
- Square, grid-aligned game objects.
- A continuous snake body with no gaps between body modules.

## Core Visual Rule

Snake and food visuals must use square modules, not rounded rectangles.

- Snake head: square module, visually distinct through visor/detail and brighter material.
- Normal body: square modules directly connected with no visual gap.
- Compressed body: square modules connected with the rest of the snake, using number/material differences to show level.
- Normal food: square chip/module.
- Merged food: square module with compact level marker.
- Special food: square module with internal scanning/core motif, not a circle.

The board grid and object geometry should feel intentionally aligned. The snake should read as one continuous segmented body rather than separated tiles.

## Information Architecture

The main screens should be treated as a compact game tool, not a landing page:

- Main menu: clear title, best score, achievements, style selection, player name, primary start action.
- Game HUD: score, level/automation state, body points, speed multiplier, next upgrade progress.
- Upgrade overlay: readable free and paid choices, clear selected state, sticky confirm button on mobile.
- Automation shop: system-module list with clear categories, price, owned level, and disabled state.
- Mobile controls: stable D-pad, A/B buttons, pause, no horizontal scroll.

## Motion

Motion should be short and local:

- Snake movement: smooth grid-to-grid motion feeling, but logic remains tick-based.
- Eating: food contracts/disappears, a short square/ring pulse appears, score floats locally.
- Food merge: four square modules fold into one upgraded square module.
- Score: readout pulse, not full-screen flash.
- Upgrade selection: subtle scan/sweep and border activation.
- Purchase: local item/readout pulse.

Background motion must stay slow and low contrast.

## Responsive Rules

Required responsive behavior:

- Desktop layout centered and constrained.
- 390px mobile width must not produce horizontal scrolling.
- Game canvas scales down cleanly.
- Upgrade overlay remains vertically scrollable.
- Confirm buttons remain reachable.
- Text in controls and cards must not overflow.

## Theme Strategy

The selectable styles remain:

- `default`: high-end square-module control console.
- `synthwave`: same layout and square-module object system, with restrained synthwave colors/background.
- `acid`: same layout and square-module object system, with sharper high-contrast accents.

Themes may change tokens and background layers, but not component geometry, object shape rules, or interaction behavior.

## Performance Constraints

The redesign must respect late-game performance:

- Avoid expensive per-cell shadows on many snake segments.
- Keep canvas feedback effects bounded.
- Reuse existing performance caches: `occupiedCells`, `cachedBodyPoints`, `foodCellsByLevel`, and `autoPathCache`.
- Prefer square fills and lightweight outlines over heavy blur.

## Verification

Automated checks should cover:

- Style switcher still exposes `default`, `synthwave`, and `acid`.
- Square-module visual markers exist.
- Snake rendering avoids body gaps.
- Existing gameplay rules and performance cache tests continue to pass.

Manual checks should cover:

- Desktop menu and game screen.
- 390px mobile menu and game screen.
- Style switching.
- Eating food and score feedback.
- Upgrade overlay scroll and selection.
- Automation shop.

Required test commands:

```powershell
node tests\behavior.test.js
node tests\game-rules.test.js
node --experimental-vm-modules tests\syntax-check.js
```

## Release

This should be released as a new visible frontend update, likely `0.4.0`, unless implementation scope becomes only a small shape adjustment.

The release must update:

- `VERSION`
- `CHANGELOG.md`
- `AGENTS.md` if durable visual rules or maintenance notes change

Then commit, tag, push `origin main`, push the tag, and verify GitHub Pages.
