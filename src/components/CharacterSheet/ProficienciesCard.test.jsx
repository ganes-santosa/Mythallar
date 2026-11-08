import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ProficienciesCard from './ProficienciesCard';

describe('ProficienciesCard', () => {
  const mockProficiencies = {
    armor: ['Light Armor', 'Medium Armor'],
    weapons: ['Simple Weapons'],
    tools: ["Thieves' Tools"],
    languages: ['Common', 'Elvish'],
  };

  it('renders all four categories with tag chips', () => {
    render(<ProficienciesCard proficiencies={mockProficiencies} onUpdateProficiencies={() => {}} />);
    expect(screen.getByText('Light Armor')).toBeInTheDocument();
    expect(screen.getByText('Simple Weapons')).toBeInTheDocument();
    expect(screen.getByText("Thieves' Tools")).toBeInTheDocument();
    expect(screen.getByText('Common')).toBeInTheDocument();
    expect(screen.getByText('Elvish')).toBeInTheDocument();
  });

  it('hides remove buttons and add buttons when isEditing is false', () => {
    render(<ProficienciesCard proficiencies={mockProficiencies} isEditing={false} onUpdateProficiencies={() => {}} />);
    expect(screen.queryByLabelText('Remove Elvish language')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Add armor proficiency')).not.toBeInTheDocument();
  });

  it('allows removing an existing proficiency chip when isEditing is true', () => {
    const handleUpdate = vi.fn();
    render(<ProficienciesCard proficiencies={mockProficiencies} isEditing={true} onUpdateProficiencies={handleUpdate} />);
    const removeBtn = screen.getByLabelText('Remove Elvish language');
    fireEvent.click(removeBtn);

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      languages: ['Common'],
    }));
  });

  it('allows adding a new chip to a category when isEditing is true', () => {
    const handleUpdate = vi.fn();
    render(<ProficienciesCard proficiencies={mockProficiencies} isEditing={true} onUpdateProficiencies={handleUpdate} />);

    const openAddBtn = screen.getByLabelText('Add armor proficiency');
    fireEvent.click(openAddBtn);

    const input = screen.getByPlaceholderText('e.g. Shields');
    fireEvent.change(input, { target: { value: 'Shields' } });

    const submitBtn = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(submitBtn);

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      armor: expect.arrayContaining(['Light Armor', 'Medium Armor', 'Shields']),
    }));

    // Form stays persistent after submit
    expect(screen.getByPlaceholderText('e.g. Shields')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Shields').value).toBe('');

    // Clicking outside closes the form
    fireEvent.pointerDown(document.body);
    expect(screen.queryByPlaceholderText('e.g. Shields')).not.toBeInTheDocument();
  });

  it('renders proficiency tag chips with Level 3 bg-dnd-panel/70', () => {
    render(<ProficienciesCard proficiencies={mockProficiencies} onUpdateProficiencies={() => {}} />);
    const chip = screen.getByText('Light Armor').closest('.group');
    expect(chip.className).toContain('bg-dnd-panel/70');
  });
});
