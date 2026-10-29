import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import useClickOutside from './useClickOutside';

function TestComponent({ onOutside }) {
  const [open, setOpen] = useState(true);
  const ref = useClickOutside(open, () => {
    onOutside();
    setOpen(false);
  });

  return (
    <div>
      <div ref={ref} data-testid="inside">Inside</div>
      <div data-testid="outside">Outside</div>
    </div>
  );
}

describe('useClickOutside', () => {
  it('calls callback when clicking outside', () => {
    const handleOutside = vi.fn();
    const { getByTestId } = render(<TestComponent onOutside={handleOutside} />);

    fireEvent.mouseDown(getByTestId('inside'));
    expect(handleOutside).not.toHaveBeenCalled();

    fireEvent.mouseDown(getByTestId('outside'));
    expect(handleOutside).toHaveBeenCalledTimes(1);
  });
});
