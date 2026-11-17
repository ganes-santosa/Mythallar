# Crop Box Vertical Size Adjustment & Custom Mode Design

## Intent & Why
Allow users to fine-tune the vertical aspect ratio of their character portrait crop between 1:1 (square, widest permitted) and 3:4 (portrait, narrowest/tallest permitted). The crop box width remains stable at 210px, while the vertical height can be adjusted between 210px (1:1) and 280px (3:4).

## Constraints & Bounds
- **Narrowest aspect ratio**: 3:4 (`cropBoxW = 210px`, `cropBoxH = 280px`).
- **Widest aspect ratio**: 1:1 square (`cropBoxW = 210px`, `cropBoxH = 210px`).
- **No landscape / wide ratios**: Height cannot be dragged smaller than 210px. Height cannot be dragged larger than 280px.
- **Fixed Width**: 210px fits comfortably across mobile and desktop inside the modal's `h-72 sm:h-80` viewport with space for handles and padding.

## User Interface & Interactions
1. **Three-Way Mode Switcher**:
   - Toolbar button group displays three options: `3:4 Portrait`, `1:1 Square`, and `Custom`.
   - Active mode gets highlighted with `bg-dnd-gold/20 text-dnd-gold`.
   - Clicking `3:4 Portrait` sets height to 280px.
   - Clicking `1:1 Square` sets height to 210px.
   - Clicking `Custom` enables handle visibility with the current height preserved.

2. **Symmetric Drag Handles in Custom Mode**:
   - Rendered only when `cropMode === 'custom'`.
   - Top and bottom edges feature horizontal pill grips with visual affordance (gold bar, hover glow, `cursor-ns-resize`, 24px touch target).
   - Dragging either handle scales height symmetrically from the center of the crop box (`height += deltaY * 2` or `height -= deltaY * 2` depending on edge).
   - Sizing is clamped strictly to `[210px, 280px]`.
   - Dragging handles stops event propagation so it never initiates image panning.
   - If user drags a handle, mode automatically switches/stays in `custom`.

3. **Dynamic Canvas & Clamping**:
   - `clampPan` and `coverScale` recompute dynamically against the active `cropBoxH` so the image always covers the frame and panning stays strictly bounded.
   - Canvas export targets `targetW = 384` and `targetH = Math.round(384 * (cropBoxH / cropBoxW))`, preserving exact user framing into compressed WebP.

## Verification
- Unit test suite in `ImageCropModal.test.jsx` covering 3-way toggle, drag handle rendering in Custom mode, height clamping between 210px and 280px, and canvas cropping.
- Live browser validation verifying symmetric handle drag, pan isolation, and profile card rendering.
