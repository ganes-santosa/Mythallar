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

  it('toggles aspect ratio between 3:4 and 1:1', () => {
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

    // 3:4 is default active
    expect(btn34.className).toContain('text-dnd-gold');

    // Switch to 1:1
    fireEvent.click(btn11);
    expect(btn11.className).toContain('text-dnd-gold');
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
});
