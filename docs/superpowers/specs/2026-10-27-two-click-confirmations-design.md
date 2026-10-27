# Two-Click Confirmation Design

**Goal:** Standardize destructive actions and quick character creation around compact two-click confirmation.

- First delete click arms button; armed state uses red styling without changing width.
- Second delete click performs deletion.
- Armed delete state resets after 3 seconds.
- Character selector plus button uses same behavior with green armed styling.
- Second plus click creates character; armed state resets after 3 seconds.
- Apply behavior to delete actions in spell cards, character manager modal, and all other existing delete controls.
- Remove obsolete expanding and popup confirmation flows.
- Preserve existing callbacks, accessibility labels, and modal close behavior.
