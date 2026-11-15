# Numeric Input UX Design

## Intent
Numeric fields must remain editable while the user is typing. Clearing a field must show an empty input instead of immediately restoring `0` or a calculated value. Nonnegative fields must not display meaningless leading zeroes.

## Chosen Approach
Use local draft strings while a field is focused or in edit mode. Store the numeric/default value on blur (or when editing ends), not on every empty keystroke. Normalize nonnegative integer input by removing leading zeroes while typing, retaining a single `0`. This follows the existing currency draft-state pattern and avoids changing saved-data schemas.

## Scope
- Currency: normalize leading zeroes while typing and commit nonnegative integers on blur.
- Ability base scores, darkvision, passive perception/investigation/insight: allow temporary empty drafts; commit base score/darkvision as `0` on empty blur, remove a passive override on empty blur to restore its calculated value.
- Other numeric editors with the same immediate-coercion problem: combat edit fields, speeds, maximum spell slots, item quantity/max attunement, and resource maximums where applicable.
- Existing draft-based resource max fields and current/temp HP fields retain their current behavior; they already permit clearing during editing.

## Behavior
- Blurring an empty numeric field restores its documented numeric default, never leaves saved data as an empty string or `NaN`.
- Negative-signed bonus fields remain supported.
- Read-only/display values remain calculated numeric values.
- No new borders, controls, or layout shifts.
