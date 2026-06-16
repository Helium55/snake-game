# Precision Control UI Redesign Design

Date: 2026-06-16

## Goal

Redesign the snake roguelike frontend as a unified, high-end technical interface. The redesign should feel professional, precise, responsive, and polished without relying on heavy gradients, generic AI-style glow, or visual clutter.

The approved direction is **Precision Control Console**:

- Dark graphite / near-black base.
- Restrained cyan, silver, amber, green, and red accents.
- Thin technical borders, modular panels, clear hierarchy.
- Subtle but visible motion for common gameplay feedback.
- Existing visual styles remain selectable, but they should share one component system instead of feeling like unrelated skins.

## Scope

This redesign covers:

- Main menu and style selector.
- Game HUD, score, level, next-upgrade, speed control, and leaderboard entry.
- Canvas container and in-canvas visual language.
- Snake head, normal body, compressed body, invincible state, and automation state.
- Normal food, merged food, special food, and functional item-like effects such as magnet.
- Upgrade overlay, upgrade cards, confirm button, and mobile scroll behavior.
- Automation shop panel and purchase states.
- Mobile D-pad, A/B buttons, pause button, and touch feedback.
- Microinteractions for movement, eating, score increases, food merging, upgrade selection, upgrade confirmation, and shop purchase.

This redesign does not change gameplay balance, scoring rules, automation logic, shop economy, Supabase leaderboard behavior, or version rollback workflow except where visual tests need marker updates.

## Design System

Use a shared token system in `index.html` CSS:

- `--bg`: page base.
- `--surface`: primary panel background.
- `--surface-strong`: modal and overlay panels.
- `--line`: default border.
- `--line-strong`: emphasized border.
- `--text`: main text.
- `--muted`: secondary text.
- `--accent`: primary cyan action.
- `--success`: snake/body green.
- `--warning`: amber food and upgrade attention.
- `--danger`: damage/game-over red.
- `--special`: violet or rare-state accent.

Cards and panels should use radii around 6-8px. Buttons and controls should have stable dimensions, clear pressed states, and no text overflow on mobile. Avoid nested card styling; repeated upgrade cards, modals, and shop items may be framed, while page sections remain simple.

## Theme Strategy

The selectable styles continue to be:

- Default: Precision Control Console.
- Synthwave: same layout and components, with restrained magenta/cyan sunset/grid background treatment.
- Acid: same layout and components, with sharper lime/cyan/magenta accents and higher contrast details.

The three styles share:

- Layout geometry.
- Button/card sizing.
- Canvas framing.
- Upgrade/shop behavior.
- Motion timings and interaction patterns.

Only tokens, background layers, and a small number of decorative accents vary by style.

## Main Menu

The main menu should become a compact control panel rather than a decorative landing page:

- Game title remains the first visual signal.
- High score and achievement count appear as small instrument readouts.
- Primary action button is visually dominant.
- Style selector appears as a segmented/panel choice with small visual swatches.
- Player name input remains visible and readable.
- Buttons use subtle lift on hover and pressed-state compression on touch/click.

## Game HUD

The game screen should prioritize scanability:

- Score, level, and high score are displayed as modular readouts.
- Speed slider shows both speed and score multiplier.
- Next upgrade progress is visible without crowding the header.
- Automation mode should feel like a system state, not a separate page.
- Auto shop button should look like a compact tool button and remain easy to tap on mobile.

HUD updates should feel responsive:

- Score increases use a short local pulse on the score value.
- Eating creates a small floating `+N` near the eaten item or near the score panel.
- Level-up creates a brief screen-edge or canvas-frame pulse, not a full-screen flash.

## Canvas And Gameplay Visuals

The canvas should retain crisp grid readability while becoming more distinctive:

- Background grid uses low-opacity technical lines, not a plain black field.
- Canvas container may use a blurred/translucent backdrop in themed styles, but the board remains readable.
- Static glow should be reduced; use short event-driven highlights instead.
- Expensive shadows and text drawing should stay limited to avoid late-game performance problems.

### Snake

Snake parts should be visually distinct:

- Head: brighter, slightly longer or shaped with a small directional face/visor cue.
- Normal body: rounded technical segments with a soft success-colored core.
- Compressed body: capsule/chip-like segment with level number and a different cyan/special material.
- High compressed levels: use stronger outline and compact text scale so levels up to 16 remain legible.
- Invincible state: amber outline or shield band around segments, not only a color swap.
- Automation state: subtle directional scan/trace effect near the head or path, kept lightweight.

Movement should feel smoother through visual interpolation or short transform-like easing where practical. Logic ticks remain authoritative; visuals can interpolate between previous and current cell positions.

### Food And Items

Food must not be visually homogeneous:

- Normal food: small chip/energy block shape, red/amber core, short idle pulse.
- Merged food: upgraded material with roman numeral or compact level marker. Four adjacent same-level foods should visually fold into one higher-level food.
- Special food: circular core with ring or orbital motif, visually different from normal food even without color.
- Magnet/functional effects: symbolized shape or icon-like marker, not just a colored square.

Food merge animation:

- Four same-level adjacent foods draw inward toward their merge point.
- A compact ring or spark appears at the merge location.
- The new food appears with a small scale-in and material change.

Eating animation:

- Food slightly contracts toward the head.
- A small ring expands and fades at the eaten cell.
- Score/body-point feedback appears locally.

## Upgrade Overlay

The upgrade overlay should feel like a tactical selection screen:

- Use a compact header, section labels, and clear separation between free and paid choices.
- Cards use consistent height and responsive wrapping.
- Selected card uses a clear border, background tint, and confirm-readiness state.
- Clicking a selected optional shop upgrade still cancels that shop choice.
- Confirm button remains sticky/reachable on mobile.
- Overlay remains vertically scrollable on small screens.

Upgrade card motion:

- Hover: subtle lift and border brightening.
- Selection: quick scan sweep or outline pulse.
- Confirmation: short compression/commit animation before returning to gameplay.
- Unaffordable paid cards remain readable but visibly disabled.

## Automation Shop

Automation shop should look like system modules:

- Items grouped or visually labeled by automation, food, and environment categories.
- Purchased levels display as small level indicators.
- Max-level items should appear complete or disappear according to existing rules.
- Purchase success uses a contained pulse on the item and body-point readout.
- New games reset automation shop effects as current rules require.

## Mobile

Mobile should remain first-class:

- Controls use stable square/tappable sizes.
- A/B buttons are clear and reachable.
- Upgrade overlay scroll is preserved.
- Text inside buttons and cards must not overflow at narrow widths.
- Canvas and UI remain centered in all styles.
- Hover-only effects must have touch/active equivalents.

## Motion Principles

Motion should be clever and polished, but short:

- Movement interpolation: 80-140ms perceived easing between grid cells.
- Eating feedback: 180-280ms ring and score pop.
- Score pulse: 180-260ms.
- Upgrade card select: 180-240ms.
- Upgrade confirm: 260-420ms.
- Food merge: 350-520ms.
- Background motion: slow and low contrast.

Respect performance:

- Avoid long-running heavy shadows on many cells.
- Prefer CSS transitions for DOM UI.
- Keep canvas animation effects bounded and time-based.
- Reuse small helper functions for drawing shapes and particles.

## Testing And Verification

Add or update source checks where practical for:

- Shared precision-control token markers.
- Continued `default`, `synthwave`, and `acid` style support.
- Mobile upgrade overlay scroll markers.
- Distinct item visual markers in draw helpers.
- Speed slider and existing gameplay behavior remain intact.

Manual verification should include:

- Desktop main menu.
- Desktop game canvas and upgrade overlay.
- Synthwave and acid style switches.
- Mobile/narrow viewport controls and upgrade scroll.
- Starting a game, eating food, triggering score changes, and opening upgrades.

Required test commands:

```powershell
node tests\behavior.test.js
node tests\game-rules.test.js
node --experimental-vm-modules tests\syntax-check.js
```

## Release

Because this is a broad visual redesign, release it as a minor version, likely `0.3.0`.

For the implementation release:

- Update `VERSION`.
- Update `CHANGELOG.md`.
- Commit changed code and tests.
- Tag the release.
- Push `origin main` and the tag.
- Verify GitHub Pages contains a marker from the redesign.
