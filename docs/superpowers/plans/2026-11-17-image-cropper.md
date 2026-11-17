# Image Cropper & Portrait Framing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide an image cropping modal supporting 3:4 and 1:1 aspect ratios with pan/zoom and offscreen canvas export, and clamp character portrait containers to prevent oversized cards.

**Architecture:** A reusable modal `src/components/Modal/ImageCropModal.jsx` handles image preview, pointer-based panning, zoom adjustment, aspect ratio toggling (3:4 portrait or 1:1 square), and canvas export. The exported crop is compressed via `compressImageFile` into a 256px WebP data URL. Both `CharacterBuilderModal.jsx` and `CharacterSheetHeader.jsx` open this modal on file selection and constrain their card portrait containers to a maximum height.

**Tech Stack:** React 18, HTML5 Canvas, Tailwind CSS, Lucide React, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-17-image-cropper-design.md`

## Global Constraints
- Pure native implementation with zero external dependencies (no `react-image-crop`).
- Support two aspect ratios: `3:4` (default) and `1:1`.
- Clamped card portrait container height (`max-h-36 sm:max-h-40 aspect-[3/4]` or bounded height) preventing vertical layout blowout.
- Final cropped output passed through `compressImageFile` (max 256px WebP data URL).
- Follow Mythallar styling: `bg-dnd-card`, `bg-dnd-panel`, `text-dnd-gold`, Title Case headers, zero box-in-a-box outlines.

## Review Focus
- Extremely tall or panoramic image inputs do not overflow or invert aspect ratios.
- Zoom slider handles min (1x) and max (3x) clamps properly.
- Canceling the crop modal leaves previous portrait untouched and resets file input.
- Switching between 3:4 and 1:1 centers the crop viewport smoothly.
- Offscreen canvas handles high-DPI scaling and gracefully exports in standard browser environments.

---

### Task 1: Reusable ImageCropModal Component

**Files:**
- Create: `src/components/Modal/ImageCropModal.jsx`
- Test: `src/components/Modal/ImageCropModal.test.jsx`

**Interfaces:**
- Consumes: `compressImageFile` from `../../utils/imageCompressor`
- Produces: `<ImageCropModal isOpen={bool} imageSrc={string} onClose={fn} onApplyCrop={fn(dataUrl)} />`

- [ ] **Step 1: Write failing test in `src/components/Modal/ImageCropModal.test.jsx`**
  - Verify modal renders when `isOpen` is true with aspect ratio buttons ("3:4 Portrait" and "1:1 Square"), zoom slider, Cancel, and Apply buttons.
  - Verify switching aspect ratio updates active state.
  - Verify clicking Cancel triggers `onClose`.
  - Verify clicking Apply triggers canvas crop export and calls `onApplyCrop`.

- [ ] **Step 2: Run test to verify it fails**
  - Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run src/components/Modal/ImageCropModal.test.jsx`
  - Expected: FAIL with module not found.

- [ ] **Step 3: Implement `ImageCropModal.jsx`**
  - State: `aspectRatio` ('3:4' | '1:1', default '3:4'), `zoom` (1 to 3, step 0.05), `panOffset` ({ x: 0, y: 0 }), `isDragging` (bool).
  - Use pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`) to allow smooth image panning.
  - Crop frame overlay: darkened backdrop with a centered framing box matching selected ratio (`3:4` or `1:1`).
  - "Apply Crop": draw the visible crop region onto an offscreen `<canvas>` at target resolution (e.g. 384x512 for 3:4, 384x384 for 1:1), pass data URL to `compressImageFile(dataUrl, 256, 0.85)`, and call `onApplyCrop(compressedDataUrl)`.

- [ ] **Step 4: Run test to verify it passes**
  - Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run src/components/Modal/ImageCropModal.test.jsx`
  - Expected: PASS.

- [ ] **Step 5: Commit**
  - `git add src/components/Modal/ImageCropModal.jsx src/components/Modal/ImageCropModal.test.jsx`
  - `git commit -m "feat: add ImageCropModal component with 3:4 and 1:1 aspect ratio options [skip ci]"`

---

### Task 2: Height Clamping & Layout Constraining in Profile Cards

**Files:**
- Modify: `src/components/CharacterSheet/CharacterSheetHeader.jsx`
- Modify: `src/components/CharacterBuilder/CharacterBuilderModal.jsx`
- Test: `src/components/CharacterSheet/CharacterSheetHeader.test.jsx`
- Test: `src/components/CharacterBuilder/CharacterBuilderModal.test.jsx`

**Interfaces:**
- Consumes: Tailwind classes for `.character-profile-card` portrait column.
- Produces: Constrained height container (`max-h-36 sm:max-h-40` with `object-cover`) ensuring no vertical blowout.

- [ ] **Step 1: Write test checking height clamping classes on portrait containers**
  - Verify portrait container has `max-h-36` or `sm:max-h-40` and `overflow-hidden` in both header and builder tests.

- [ ] **Step 2: Update portrait containers in `CharacterSheetHeader.jsx` and `CharacterBuilderModal.jsx`**
  - In `CharacterSheetHeader.jsx`:
    Replace `<div className="relative flex-shrink-0 w-28 sm:w-36 md:w-44 self-stretch overflow-hidden group select-none">`
    with `<div className="relative flex-shrink-0 w-28 sm:w-36 md:w-44 max-h-36 sm:max-h-40 self-stretch overflow-hidden group select-none">`
  - In `CharacterBuilderModal.jsx`:
    Replace `<div className="relative flex-shrink-0 w-28 sm:w-36 md:w-40 self-stretch overflow-hidden group select-none">`
    with `<div className="relative flex-shrink-0 w-28 sm:w-36 md:w-40 max-h-36 sm:max-h-40 self-stretch overflow-hidden group select-none">`

- [ ] **Step 3: Run tests to verify they pass**
  - Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run src/components/CharacterSheet/CharacterSheetHeader.test.jsx src/components/CharacterBuilder/CharacterBuilderModal.test.jsx`
  - Expected: PASS.

- [ ] **Step 4: Commit**
  - `git commit -am "style: clamp portrait container height in character cards to prevent vertical expansion [skip ci]"`

---

### Task 3: Integrate ImageCropModal into CharacterBuilderModal

**Files:**
- Modify: `src/components/CharacterBuilder/CharacterBuilderModal.jsx`
- Test: `src/components/CharacterBuilder/CharacterBuilderModal.test.jsx`

**Interfaces:**
- Consumes: `ImageCropModal`
- Produces: Integrated file upload $\rightarrow$ crop modal $\rightarrow$ `details.portrait`.

- [ ] **Step 1: Write test in `CharacterBuilderModal.test.jsx` for crop flow**
  - Verify selecting a file stages `cropImageSrc` and renders `ImageCropModal`.
  - Verify applying crop updates `details.portrait` and closes the crop modal.

- [ ] **Step 2: Update `CharacterBuilderModal.jsx`**
  - Add state `cropModalState: { isOpen: bool, imageSrc: string }`.
  - In `handlePortraitUpload(e)`:
    Read selected file with `FileReader.readAsDataURL` into `cropModalState.imageSrc`, then set `isOpen: true`. Reset `e.target.value`.
  - On `onApplyCrop(croppedUrl)`:
    `setDetails(prev => ({ ...prev, portrait: croppedUrl }))`, reset `cropModalState`.
  - Render `<ImageCropModal>` conditionally when `cropModalState.isOpen`.

- [ ] **Step 3: Run test to verify it passes**
  - Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run src/components/CharacterBuilder/CharacterBuilderModal.test.jsx`
  - Expected: PASS.

- [ ] **Step 4: Commit**
  - `git commit -am "feat: integrate ImageCropModal into CharacterBuilderModal [skip ci]"`

---

### Task 4: Integrate ImageCropModal into CharacterSheetHeader

**Files:**
- Modify: `src/components/CharacterSheet/CharacterSheetHeader.jsx`
- Test: `src/components/CharacterSheet/CharacterSheetHeader.test.jsx`

**Interfaces:**
- Consumes: `ImageCropModal`
- Produces: Integrated file upload $\rightarrow$ crop modal $\rightarrow$ `identity.portrait`.

- [ ] **Step 1: Write test in `CharacterSheetHeader.test.jsx` for crop flow**
  - Verify selecting an avatar file triggers `ImageCropModal`.
  - Verify applying crop updates character `identity.portrait`.

- [ ] **Step 2: Update `CharacterSheetHeader.jsx`**
  - Add state `cropModalState: { isOpen: bool, imageSrc: string }`.
  - In `handlePortraitUpload(e)`:
    Read file as Data URL, set `cropModalState: { isOpen: true, imageSrc: dataUrl }`. Reset `e.target.value`.
  - In `onApplyCrop(croppedUrl)`:
    Call `handleIdentityChange('portrait', croppedUrl)`, close `cropModalState`.
  - Render `<ImageCropModal>` in JSX.

- [ ] **Step 3: Run test to verify it passes**
  - Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run src/components/CharacterSheet/CharacterSheetHeader.test.jsx`
  - Expected: PASS.

- [ ] **Step 4: Commit**
  - `git commit -am "feat: integrate ImageCropModal into CharacterSheetHeader [skip ci]"`

---

### Task 5: Suite Verification & Visual Inspection

**Files:**
- Whole project verification

- [ ] **Step 1: Run full test suite**
  - Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd test -- --run`
  - Expected: All test suites PASS.

- [ ] **Step 2: Run production build**
  - Run: `$env:Path="C:\Program Files\nodejs;"+$env:Path; npm.cmd run build`
  - Expected: Build PASS with no errors.

- [ ] **Step 3: Visual inspection via browser screenshot**
  - Open localhost:5173, inspect portrait upload with tall image to confirm proper cropping and uniform card height.
