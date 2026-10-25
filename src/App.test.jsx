import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from './App';

const MOCK_SPELLS = [
  {
    id: 'fireball',
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    time: '1 action',
    range: '150 feet',
    duration: 'Instantaneous',
    components: { v: true, s: true, m: 'guano' },
    classes: ['Sorcerer', 'Wizard'],
    entries: ['Blossoms with a low roar into an explosion of flame.'],
    higherLevels: 'Damage increases by 1d6 per slot.',
  },
  {
    id: 'magic-missile',
    name: 'Magic Missile',
    level: 1,
    school: 'Evocation',
    time: '1 action',
    range: '120 feet',
    duration: 'Instantaneous',
    components: { v: true, s: true },
    classes: ['Sorcerer', 'Wizard'],
    entries: ['You create three glowing darts of magical force.'],
  },
];

describe('App End-to-End Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_SPELLS,
    });
  });

  it('renders application with loaded spells and character profile', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Fireball')).toBeInTheDocument();
      expect(screen.getByText('Magic Missile')).toBeInTheDocument();
    });

    expect(screen.getByText(/D&D 5e Spellbook/i)).toBeInTheDocument();
    expect(screen.getByText('Mordenkainen')).toBeInTheDocument();
  });

  it('allows clicking a spell to expand accordion and adding it to spellbook', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Fireball')).toBeInTheDocument();
    });

    // Click fireball card to toggle accordion
    fireEvent.click(screen.getByText('Fireball'));

    // Accordion should display entries and "Add to Spellbook" button
    expect(await screen.findByText(/Blossoms with a low roar/i)).toBeInTheDocument();

    const addBtn = await screen.findByRole('button', { name: /Add to Spellbook/i });
    fireEvent.click(addBtn);

    // Spell should now appear in Spellbook pane on the right
    await waitFor(() => {
      expect(screen.getAllByText('Fireball').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('allows casting a spell and expends matching slot', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Magic Missile')).toBeInTheDocument();
    });

    // Add Magic Missile (1st level) via accordion
    fireEvent.click(screen.getByText('Magic Missile'));
    const addBtn = await screen.findByRole('button', { name: /Add to Spellbook/i });
    fireEvent.click(addBtn);

    // Find Cast button in the spellbook
    const castBtn = await screen.findByLabelText(/Quick-Cast Magic Missile/i);
    fireEvent.click(castBtn);

    // Slot 1 should be expended: Wizard Lvl 1 starts with 2 slots max. 1 used -> 1/2 remaining.
    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });
  });

  it('restores all expended slots when Long Rest is clicked', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Magic Missile')).toBeInTheDocument();
    });

    // Add and cast
    fireEvent.click(screen.getByText('Magic Missile'));
    fireEvent.click(await screen.findByRole('button', { name: /Add to Spellbook/i }));

    fireEvent.click(await screen.findByLabelText(/Quick-Cast Magic Missile/i));
    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    // Click Long Rest
    const restBtn = screen.getByRole('button', { name: /Long Rest/i });
    fireEvent.click(restBtn);

    // Should reset to 2 / 2
    await waitFor(() => {
      expect(screen.getByText('2 / 2')).toBeInTheDocument();
    });
  });

  it('allows creating and cataloging a custom homebrew spell', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Fireball')).toBeInTheDocument();
    });

    // Click "+ Custom Spell" button
    const customBtn = screen.getByRole('button', { name: /Custom Spell/i });
    fireEvent.click(customBtn);

    // Fill modal form
    fireEvent.change(screen.getByLabelText(/Spell Name/i), {
      target: { value: 'Shadow Lance' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'A piercing beam of pure gloom.' },
    });

    // Save
    fireEvent.click(screen.getByRole('button', { name: /Save Spell/i }));

    // Custom spell should appear in catalog
    await waitFor(() => {
      expect(screen.getByText('Shadow Lance')).toBeInTheDocument();
    });
  });
});
