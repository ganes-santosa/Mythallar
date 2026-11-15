import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ToastBanner from './ToastBanner';

function dispatchPointer(element, type, { clientX = 0, pointerId = 1 } = {}) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { clientX, pointerId });
  element.dispatchEvent(event);
}

describe('ToastBanner', () => {
  it('renders message and appropriate icon', () => {
    const { rerender } = render(
      <ToastBanner toast={{ message: 'Long Rest completed!', type: 'success' }} onDismiss={() => {}} />
    );
    expect(screen.getByText('Long Rest completed!')).toBeInTheDocument();
    expect(screen.getByTestId('toast-icon-success')).toBeInTheDocument();

    rerender(
      <ToastBanner toast={{ message: 'Sync failed', type: 'error' }} onDismiss={() => {}} />
    );
    expect(screen.getByText('Sync failed')).toBeInTheDocument();
    expect(screen.getByTestId('toast-icon-error')).toBeInTheDocument();

    rerender(
      <ToastBanner toast={{ message: 'Cloud sync in progress', type: 'info' }} onDismiss={() => {}} />
    );
    expect(screen.getByText('Cloud sync in progress')).toBeInTheDocument();
    expect(screen.getByTestId('toast-icon-info')).toBeInTheDocument();
  });

  it('calls onDismiss when swiped horizontally to the right beyond threshold', () => {
    const handleDismiss = vi.fn();
    render(
      <ToastBanner
        toast={{ message: 'Swipe me right', type: 'success' }}
        onDismiss={handleDismiss}
      />
    );

    const banner = screen.getByRole('status');
    act(() => {
      dispatchPointer(banner, 'pointerdown', { clientX: 100, pointerId: 1 });
      dispatchPointer(banner, 'pointermove', { clientX: 180, pointerId: 1 }); // +80px
      dispatchPointer(banner, 'pointerup', { clientX: 180, pointerId: 1 });
    });

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when swiped horizontally to the left beyond threshold', () => {
    const handleDismiss = vi.fn();
    render(
      <ToastBanner
        toast={{ message: 'Swipe me left', type: 'info' }}
        onDismiss={handleDismiss}
      />
    );

    const banner = screen.getByRole('status');
    act(() => {
      dispatchPointer(banner, 'pointerdown', { clientX: 200, pointerId: 1 });
      dispatchPointer(banner, 'pointermove', { clientX: 120, pointerId: 1 }); // -80px
      dispatchPointer(banner, 'pointerup', { clientX: 120, pointerId: 1 });
    });

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('snaps back and does not call onDismiss when horizontal drag is below threshold', () => {
    const handleDismiss = vi.fn();
    render(
      <ToastBanner
        toast={{ message: 'Short drag', type: 'info' }}
        onDismiss={handleDismiss}
      />
    );

    const banner = screen.getByRole('status');
    act(() => {
      dispatchPointer(banner, 'pointerdown', { clientX: 100, pointerId: 1 });
      dispatchPointer(banner, 'pointermove', { clientX: 130, pointerId: 1 }); // +30px (< 60px)
      dispatchPointer(banner, 'pointerup', { clientX: 130, pointerId: 1 });
    });

    expect(handleDismiss).not.toHaveBeenCalled();
    expect(banner.style.transform).toBe('translateX(0px)');
  });

  it('resets position on pointerCancel without dismissing', () => {
    const handleDismiss = vi.fn();
    render(
      <ToastBanner
        toast={{ message: 'Cancel test', type: 'info' }}
        onDismiss={handleDismiss}
      />
    );

    const banner = screen.getByRole('status');
    act(() => {
      dispatchPointer(banner, 'pointerdown', { clientX: 100, pointerId: 1 });
      dispatchPointer(banner, 'pointermove', { clientX: 180, pointerId: 1 });
      dispatchPointer(banner, 'pointercancel', { pointerId: 1 });
    });

    expect(handleDismiss).not.toHaveBeenCalled();
    expect(banner.style.transform).toBe('translateX(0px)');
  });
});
