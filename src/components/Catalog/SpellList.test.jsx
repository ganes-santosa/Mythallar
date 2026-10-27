import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import SpellList from './SpellList';

describe('SpellList', () => {
  it('fills remaining pane height instead of 100% so the scroll track is not clipped', () => {
    const { container } = render(<SpellList spells={[]} />);
    const root = container.firstChild;
    expect(root).toHaveClass('flex-1', 'min-h-0');
    expect(root).not.toHaveClass('h-full');
  });
});
