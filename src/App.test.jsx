import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from './App';
import { STORAGE_KEY, createDefaultProfile } from './utils/storage';

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
    const defaultChar = createDefaultProfile('Mordenkainen', 'Wizard');
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profiles: [defaultChar],
        activeId: defaultChar.id,
      })
    );
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

    expect(screen.getByText(/Mythallar/i)).toBeInTheDocument();
    expect(screen.getByText(/DnD 5e Spellbook/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Mordenkainen' })).toBeInTheDocument();
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
    const addBtns = await screen.findAllByRole('button', { name: /Add to Spellbook/i });
    fireEvent.click(addBtns[0]);

    // Finish copying so the spell can be cast
    fireEvent.click(await screen.findByLabelText(/Finish copying Magic Missile/i));
    fireEvent.click(screen.getByLabelText(/Click again to finish copying Magic Missile/i));

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

    // Add, finish copying, and cast
    fireEvent.click(screen.getByText('Magic Missile'));
    const addBtns = await screen.findAllByRole('button', { name: /Add to Spellbook/i });
    fireEvent.click(addBtns[0]);

    fireEvent.click(await screen.findByLabelText(/Finish copying Magic Missile/i));
    fireEvent.click(screen.getByLabelText(/Click again to finish copying Magic Missile/i));

    fireEvent.click(await screen.findByLabelText(/Quick-Cast Magic Missile/i));
    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    // Click Long Rest and confirm
    const restBtn = screen.getByRole('button', { name: /Long Rest/i });
    fireEvent.click(restBtn);
    const confirmBtn = screen.getByLabelText(/Confirm Long Rest/i);
    fireEvent.click(confirmBtn);

    // Should reset to 2 / 2
    await waitFor(() => {
      expect(screen.getByText('2 / 2')).toBeInTheDocument();
    });
  });

  it('allows creating and cataloging a homebrew spell', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Fireball')).toBeInTheDocument();
    });

    // Click "+ Homebrew Spell" button
    const homebrewBtn = screen.getByRole('button', { name: /Homebrew Spell/i });
    fireEvent.click(homebrewBtn);

    // Fill modal form
    fireEvent.change(screen.getByLabelText(/Spell Name/i), {
      target: { value: 'Shadow Lance' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'A piercing beam of pure gloom.' },
    });

    // Save
    fireEvent.click(screen.getByRole('button', { name: /Save Spell/i }));

    // Homebrew spell should appear in catalog
    await waitFor(() => {
      expect(screen.getByText('Shadow Lance')).toBeInTheDocument();
    });
  });

  it('places newly added leveled spells into Copying state for Wizards until confirmed finished', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Magic Missile')).toBeInTheDocument();
    });

    // Default character Mordenkainen is a Wizard. Add 1st-level Magic Missile.
    fireEvent.click(screen.getByText('Magic Missile'));
    const addBtns = await screen.findAllByRole('button', { name: /Add to Spellbook/i });
    fireEvent.click(addBtns[0]);

    // Enters copying state: Copying badge & Finish Copying button visible; Prepare button absent
    expect(await screen.findByText('Copying')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Toggle Prepared for Magic Missile/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Finish copying all spells/i)).toBeInTheDocument();

    // Check 1st-level copying requirements (2 hours, 50 gp)
    fireEvent.click(screen.getByLabelText(/Copying requirements for Magic Missile/i));
    expect(screen.getByText(/2 hours/i)).toBeInTheDocument();
    expect(screen.getByText(/50 gp/i)).toBeInTheDocument();

    // Two-click confirm Finish Copying
    fireEvent.click(screen.getByLabelText(/Finish copying Magic Missile/i));
    fireEvent.click(screen.getByLabelText(/Click again to finish copying Magic Missile/i));

    // Copying badge and Finish Copying All disappear; Prepare button is restored
    await waitFor(() => {
      expect(screen.queryByText('Copying')).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Finish copying all spells/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/Toggle Prepared for Magic Missile/i)).toBeInTheDocument();
    });
  });

  it('starts with no character and prompts creation when storage is empty', async () => {
    localStorage.clear();
    render(<App />);

    expect(await screen.findByText('No Character Selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create First Character/i })).toBeInTheDocument();

    // Click button to open modal
    fireEvent.click(screen.getByRole('button', { name: /Create First Character/i }));
    expect(screen.getByRole('heading', { name: 'Create Character' })).toBeInTheDocument();

    // Fill form and create
    fireEvent.change(screen.getByLabelText(/Character Name/i), {
      target: { value: 'Gandalf the Grey' },
    });
    fireEvent.change(screen.getByLabelText(/Starting Class/i), {
      target: { value: 'Wizard' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Create Character/i }));

    // Character created and active
    expect(await screen.findByRole('heading', { level: 2, name: 'Gandalf the Grey' })).toBeInTheDocument();
    expect(screen.queryByText('No Character Selected')).not.toBeInTheDocument();
  });

  it('allows deleting the sole character via CharacterManagerModal and reverts to empty state', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { level: 2, name: 'Mordenkainen' })).toBeInTheDocument();

    // Open CharacterManagerModal
    const manageBtn = screen.getByRole('button', { name: /Manage Characters/i });
    fireEvent.click(manageBtn);

    expect(screen.getByRole('heading', { name: 'Character Grimoires' })).toBeInTheDocument();

    // Delete Mordenkainen (armed then confirm)
    const deleteBtn = screen.getByRole('button', { name: /Delete Mordenkainen/i });
    fireEvent.click(deleteBtn);
    const armedBtn = screen.getByRole('button', { name: /Click again to delete Mordenkainen/i });
    fireEvent.click(armedBtn);

    // Modal closes and empty state displays
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Character Grimoires' })).not.toBeInTheDocument();
      expect(screen.getByText('No Character Selected')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create First Character/i })).toBeInTheDocument();
    });
  });
});
