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

  it('allows removing an existing proficiency chip', () => {
    const handleUpdate = vi.fn();
    render(<ProficienciesCard proficiencies={mockProficiencies} onUpdateProficiencies={handleUpdate} />);
    const removeBtn = screen.getByLabelText('Remove Elvish language');
    fireEvent.click(removeBtn);

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      languages: ['Common'],
    }));
  });

  it('allows adding a new chip to a category', () => {
    const handleUpdate = vi.fn();
    render(<ProficienciesCard proficiencies={mockProficiencies} onUpdateProficiencies={handleUpdate} />);

    const openAddBtn = screen.getByLabelText('Add armor proficiency');
    fireEvent.click(openAddBtn);

    const input = screen.getByPlaceholderText('e.g. Shields');
    fireEvent.change(input, { target: { value: 'Shields' } });

    const submitBtn = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(submitBtn);

    expect(handleUpdate).toHaveBeenCalledWith(expect.objectContaining({
      armor: expect.arrayContaining(['Light Armor', 'Medium Armor', 'Shields']),
    }));
  });
});
