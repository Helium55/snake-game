# Auto Frontal Feeding Design

## Goal

Add an automation shop upgrade that lets automated runs consume multiple real map foods when the snake reaches food, without creating teleporting movement or clearing the whole board.

## Player-Facing Rule

- Add a new `auto` category automation shop item.
- The upgrade increases automated feeding from one food per bite to a frontal area bite.
- At max level, each bite consumes all normal foods inside the snake head's forward 3 by 3 area.
- The 3 by 3 area is based on the current movement direction: three cells deep in front of the head and one cell to either side.
- The head cell's directly eaten food is always included when present.
- Special food is not consumed by this upgrade.

## Upgrade Behavior

- The upgrade has 3 levels.
- Level 1 consumes up to the direct food plus the nearest one normal food in the forward area.
- Level 2 consumes up to the direct food plus the nearest three normal foods in the forward area.
- Level 3 consumes every normal food in the forward 3 by 3 area.
- Extra consumed foods are removed from `foods` and settled as real food eats.
- Each consumed food uses its own food level for score, `foodEaten`, `upgradeProgress`, body growth, body points, effects, and food respawn.
- Food merging still runs after the batch resolves.

## Constraints

- Only active in `autoMode`.
- Keep normal manual eating unchanged.
- Keep existing performance caches: call `markSnakeChanged()` after body changes and `invalidateAutoPath()` after food changes.
- Do not add global persistent state; automation shop state remains per-run.
- Keep the item in the `auto` tab, not the `food` tab.

## Tests

- Source tests should assert the new item id, level variable, forward area helper, and batch consumption helper exist.
- Behavior tests should cover that auto mode can remove multiple foods from the forward 3 by 3 area and increase score/progress/body length accordingly.
- Existing behavior, source, and syntax checks must keep passing.
