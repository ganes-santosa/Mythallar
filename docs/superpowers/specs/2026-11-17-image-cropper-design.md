# Image Cropper & Portrait Framing Design

## Problem
When users upload portraits with tall/narrow aspect ratios, `.character-profile-card` (which uses `flex items-stretch`) expands vertically to match the natural height of the image. This causes excessive vertical space between identity fields in both `CharacterBuilderModal.jsx` and `CharacterSheetHeader.jsx`. Furthermore, users cannot frame or zoom their uploaded character art to focus on faces or desired details.

## Requirements
1. **Aspect Ratio Choices**:
   - Support `1:1` (Square) and `3:4` (Standard Portrait).
   - Default to `3:4` (standard character portrait framing).
2. **Crop Modal Experience (`ImageCropModal.jsx`)**:
   - Selecting an image file in `CharacterBuilderModal` or `CharacterSheetHeader` opens `ImageCropModal`.
   - Modal displays the image within an interactive viewport:
     - Drag/pan to reposition the image.
     - Zoom slider (1x to 3x) to scale into details.
     - Aspect ratio toggle pills: `1:1` and `3:4`.
     - Darkened translucent backdrop outside the active crop frame with golden framing guide.
   - Actions:
     - "Cancel" aborts without altering current portrait.
     - "Apply Crop" renders the crop rect to an offscreen `<canvas>`, compresses via `compressImageFile(fileOrCanvas, 256, 0.85)` to a WebP data URL, and updates the character state.
3. **Layout Height Clamping**:
   - In both `CharacterBuilderModal` and `CharacterSheetHeader`, constrain portrait container with `max-h-36 sm:max-h-40 aspect-[3/4]` (or `aspect-square` based on ratio) and `object-cover` so the card height remains tight and uniform regardless of input image dimensions.
4. **Zero Dependencies**:
   - Implement purely with native HTML5 Canvas + standard pointer events. No external npm libraries.

## Approaches Considered
- **Approach 1: Native Canvas Cropper Modal (Selected)**:
  - Custom React modal using standard pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`) and HTML5 Canvas.
  - Zero bundle bloat, no external CSS, matches Mythallar theme perfectly, simple Vitest integration.
- **Approach 2: Third-party Library (`react-image-crop`)**:
  - Adds extra bundle size, requires external CSS overrides, and requires extra test mocking.
- **Approach 3: CSS Focal Point Only**:
  - Does not crop pixel data or scale, saving unneeded image dimensions in state.

## Architecture & Components
1. `src/components/Modal/ImageCropModal.jsx`:
   - Interactive cropper modal with pan, zoom slider, ratio toggle (1:1 / 3:4), and canvas export.
2. `src/components/Modal/ImageCropModal.test.jsx`:
   - Test suite verifying render, ratio toggling, zoom control, and crop export.
3. `src/components/CharacterBuilder/CharacterBuilderModal.jsx`:
   - Intercepts file upload, displays `ImageCropModal`, applies cropped WebP to `details.portrait`.
   - Adds height clamping on portrait container.
4. `src/components/CharacterSheet/CharacterSheetHeader.jsx`:
   - Intercepts file upload, displays `ImageCropModal`, applies cropped WebP to `identity.portrait`.
   - Adds height clamping on portrait container.
