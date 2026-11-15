# Swipeable Toast Notifications Design

## Intent
Allow users to swipe toast notifications away horizontally (left or right) instead of waiting for the auto-dismiss timer.

## User Need
When notifications appear (such as "Long Rest completed: HP, Hit Dice, and Spell Slots restored!"), users want to clear them immediately with a quick swipe or drag gesture in either horizontal direction.

## Approach
Extract a reusable `ToastBanner` component (`src/components/Common/ToastBanner.jsx`) using native pointer events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel` with `setPointerCapture` where supported):
- Track horizontal displacement `deltaX`.
- Apply real-time visual translation `translateX(${deltaX}px)` and proportional opacity drop.
- Threshold: 60px displacement triggers dismiss in that direction; under 60px snaps back with smooth transition.
- Use `touch-action: pan-y` to allow vertical scroll while capturing horizontal swipe.
- Cursor styling: `cursor-grab active:cursor-grabbing`.
- Wire `onDismiss` callback in `App.jsx` (and other toast consumers) to clear toast state immediately.
