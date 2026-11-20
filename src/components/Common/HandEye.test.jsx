import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HandEye from './HandEye';

describe('HandEye icon', () => {
  it('renders svg with custom size and className', () => {
    const { container } = render(<HandEye size={18} className="custom-icon" data-testid="hand-eye" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '18');
    expect(svg).toHaveAttribute('height', '18');
    expect(svg).toHaveAttribute('viewBox', '40 16 176 224');
    expect(svg).toHaveClass('custom-icon');
  });
});
