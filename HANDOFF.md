# HANDOFF

## Current state (v2.0.1)
- **D&D Beyond Character Sheet Parity:** Built full modular card deck in left pane (`Grimoire` / `Character Sheet` toggle):
  - **Identity & Portrait:** Client-side HTML Canvas image compressor (`imageCompressor.js`) downsamples uploads to <=256x256 WebP data URLs (<30 KB). Name, level, proficiency, race, subclass, background metadata.
  - **Combat Vitals & Formulations:** HP, max HP, temp HP, AC formula, initiative (auto DEX mod + override), speed, hit dice tracker, 3-point death saves (successes/failures), and damage defenses tagger.
  - **Ability Scores & Saving Throws:** Auto-calculated modifiers and saving throw bonuses with proficiency toggle dots.
  - **Skills & Senses:** 18 standard 5e skills with 3-state cycle (none -> proficient -> expertise -> none), skill search filter, Darkvision input, and passive senses banner (Perception, Investigation, Insight).
  - **Proficiencies & Training:** Categorized chips for Armor, Weapons, Tools, and Languages with inline add/remove.
  - **Tracked Resources & Notes:** Custom counter steppers (Lucky, Chronal Shift, etc.) and freeform notes.
  - **Items & Attunement:** Attunement capacity tracking (`X / 3`) with glowing ivory bookmark strips (`#EFE9E0`).
- **Excluded by request:** Actions & Attack Breakdown card.
- **Verification:** 36 test files (186 tests) passing; production build clean.

## Next up
- Push commits to remote or add character export/import for new sheet fields if needed.

## Open questions
- (none)
