import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImageCropModal from './ImageCropModal';

describe('ImageCropModal', () => {
  const sampleImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock HTMLCanvasElement.getContext and toDataURL in jsdom
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      drawImage: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
    });
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/webp;base64,mockCroppedWebp');
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ImageCropModal
        isOpen={false}
        imageSrc={sampleImage}
        onClose={vi.fn()}
        onApplyCrop={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with aspect ratio buttons, zoom controls, cancel and apply buttons when isOpen is true', () => {
    render(
      <ImageCropModal
        isOpen={true}
        imageSrc={sampleImage}
        onClose={vi.fn()}
        onApplyCrop={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /Crop Character Portrait/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3:4 Portrait/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1:1 Square/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Zoom/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply Crop/i })).toBeInTheDocument();
  });

  it('supports 3-way toggle between 3:4 Portrait, 1:1 Square, and Custom', () => {
    render(
      <ImageCropModal
        isOpen={true}
        imageSrc={sampleImage}
        onClose={vi.fn()}
        onApplyCrop={vi.fn()}
      />
    );

    const btn34 = screen.getByRole('button', { name: /3:4 Portrait/i });
    const btn11 = screen.getByRole('button', { name: /1:1 Square/i });
    const btnCustom = screen.getByRole('button', { name: /^Custom$/i });

    // 3:4 is default active
    expect(btn34.className).toContain('text-dnd-gold');
    const framingBox = screen.getByTestId('crop-framing-box');
    expect(framingBox.style.height).toBe('280px');
    expect(framingBox.style.width).toBe('210px');

    // Switch to 1:1
    fireEvent.click(btn11);
    expect(btn11.className).toContain('text-dnd-gold');
    expect(btn34.className).not.toContain('text-dnd-gold');
    expect(framingBox.style.height).toBe('210px');
    expect(framingBox.style.width).toBe('210px');

    // Switch to Custom
    fireEvent.click(btnCustom);
    expect(btnCustom.className).toContain('text-dnd-gold');
    expect(btn11.className).not.toContain('text-dnd-gold');
    expect(btn34.className).not.toContain('text-dnd-gold');
  });

  it('calls onClose when clicking Cancel button or backdrop close', () => {
    const handleClose = vi.fn();
    render(
      <ImageCropModal
        isOpen={true}
        imageSrc={sampleImage}
        onClose={handleClose}
        onApplyCrop={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onApplyCrop with cropped data url when clicking Apply Crop', async () => {
    const handleApply = vi.fn();
    render(
      <ImageCropModal
        isOpen={true}
        imageSrc={sampleImage}
        onClose={vi.fn()}
        onApplyCrop={handleApply}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Apply Crop/i }));

    await waitFor(() => {
      expect(handleApply).toHaveBeenCalledWith(expect.stringContaining('data:image/'));
    });
  });

  it('renders image without transition-transform lag class and caps minimum zoom at 1.0x to cover crop frame', () => {
    render(
      <ImageCropModal
        isOpen={true}
        imageSrc={sampleImage}
        onClose={vi.fn()}
        onApplyCrop={vi.fn()}
      />
    );

    const img = screen.getByAltText(/Portrait Crop Preview/i);
    expect(img.className).not.toContain('transition-transform');
    expect(img.className).not.toContain('duration-75');

    const zoomInput = screen.getByLabelText(/Zoom/i);
    expect(zoomInput).toHaveAttribute('min', '1');
  });

  it('renders symmetric vertical drag handles only in Custom mode and clamps height to [210, 280]', () => {
    render(
      <ImageCropModal
        isOpen={true}
        imageSrc={sampleImage}
        onClose={vi.fn()}
        onApplyCrop={vi.fn()}
      />
    );

    // In 3:4 default mode, handles should not exist
    expect(screen.queryByLabelText(/Adjust top crop boundary/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Adjust bottom crop boundary/i)).not.toBeInTheDocument();

    // Switch to Custom mode
    fireEvent.click(screen.getByRole('button', { name: /^Custom$/i }));
    const topHandle = screen.getByLabelText(/Adjust top crop boundary/i);
    const bottomHandle = screen.getByLabelText(/Adjust bottom crop boundary/i);
    expect(topHandle).toBeInTheDocument();
    expect(bottomHandle).toBeInTheDocument();

    const framingBox = screen.getByTestId('crop-framing-box');
    expect(framingBox.style.height).toBe('280px');

    // Drag bottom handle upwards by 20px -> height should reduce by 40px (symmetrical from center) -> 240px
    fireEvent.pointerDown(bottomHandle, { clientY: 200, pointerId: 1 });
    fireEvent.pointerMove(bottomHandle, { clientY: 180, pointerId: 1 });
    fireEvent.pointerUp(bottomHandle, { pointerId: 1 });

    expect(framingBox.style.height).toBe('240px');

    // Drag bottom handle far up -> clamps at minimum 210px (1:1 square)
    fireEvent.pointerDown(bottomHandle, { clientY: 180, pointerId: 1 });
    fireEvent.pointerMove(bottomHandle, { clientY: 50, pointerId: 1 });
    fireEvent.pointerUp(bottomHandle, { pointerId: 1 });

    expect(framingBox.style.height).toBe('210px');

    // Drag top handle far up -> clamps at maximum 280px (3:4 portrait)
    fireEvent.pointerDown(topHandle, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(topHandle, { clientY: 0, pointerId: 1 });
    fireEvent.pointerUp(topHandle, { pointerId: 1 });

    expect(framingBox.style.height).toBe('280px');

    // Arrow keys adjust height accessibility
    fireEvent.keyDown(bottomHandle, { key: 'ArrowUp' });
    expect(framingBox.style.height).toBe('270px');

    fireEvent.keyDown(bottomHandle, { key: 'ArrowDown' });
    expect(framingBox.style.height).toBe('280px');
  });
});
