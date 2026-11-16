import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import SuggestionInput from './SuggestionInput';

describe('SuggestionInput', () => {
  const sampleSuggestions = [
    {
      name: 'Enduring Spellbook',
      typeLine: 'Wondrous Item, Common',
      category: 'magic',
      rarity: 'common',
      source: 'XDMG',
    },
    {
      name: 'Bag of Holding',
      typeLine: 'Wondrous Item, Uncommon',
      category: 'magic',
      rarity: 'uncommon',
      source: 'DMG',
      requiresAttunement: true,
    },
  ];

  it('renders input with value and handles change', () => {
    const handleChange = vi.fn();
    render(
      <SuggestionInput
        id="test-input"
        aria-label="Item Name"
        value="Bag"
        onChange={handleChange}
        suggestions={[]}
      />
    );

    const input = screen.getByLabelText('Item Name');
    expect(input.value).toBe('Bag');
    fireEvent.change(input, { target: { value: 'Bags' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('does not display suggestions on focus alone, only when typing', () => {
    render(
      <SuggestionInput
        id="test-input"
        aria-label="Item Name"
        value="Bag"
        onChange={() => {}}
        suggestions={sampleSuggestions}
      />
    );

    const input = screen.getByLabelText('Item Name');
    fireEvent.focus(input);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Bags' } });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('displays suggestions dropdown on typing and selects via click', () => {
    const handleSelect = vi.fn();
    function Wrapper() {
      const [val, setVal] = useState('');
      return (
        <SuggestionInput
          id="test-input"
          aria-label="Item Name"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          suggestions={sampleSuggestions}
          onSelectSuggestion={handleSelect}
        />
      );
    }

    render(<Wrapper />);
    const input = screen.getByLabelText('Item Name');
    fireEvent.change(input, { target: { value: 'Enduring' } });

    const option = screen.getByText('Enduring Spellbook');
    expect(option).toBeInTheDocument();
    expect(screen.getByText('Attune')).toBeInTheDocument();

    fireEvent.mouseDown(option);
    expect(handleSelect).toHaveBeenCalledWith(sampleSuggestions[0]);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes suggestions dropdown on blur or click away', () => {
    render(
      <div>
        <SuggestionInput
          id="test-input"
          aria-label="Item Name"
          value=""
          onChange={() => {}}
          suggestions={sampleSuggestions}
        />
        <button type="button">Outside Button</button>
      </div>
    );

    const input = screen.getByLabelText('Item Name');
    fireEvent.change(input, { target: { value: 'Bags' } });
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.blur(input);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not select suggestion on Enter, closes dropdown, and blurs input', () => {
    const handleSelect = vi.fn();
    render(
      <SuggestionInput
        id="test-input"
        aria-label="Item Name"
        value=""
        onChange={() => {}}
        suggestions={sampleSuggestions}
        onSelectSuggestion={handleSelect}
      />
    );

    const input = screen.getByLabelText('Item Name');
    fireEvent.change(input, { target: { value: 'Bag' } });
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleSelect).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
