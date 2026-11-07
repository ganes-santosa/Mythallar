import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

    // Main branding header logo matches text-dnd-ivory
    const brandingHeader = screen.getByRole('heading', { level: 1, name: 'Mythallar' }).closest('div');
    const headerLogo = brandingHeader.parentElement.querySelector('div[role="img"][aria-label="Mythallar Logo"]');
    expect(headerLogo).toBeInTheDocument();
    expect(headerLogo).toHaveClass('bg-dnd-ivory');
  });

  it('allows toggling left pane view between Spells Grimoire and Character Sheet', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Fireball')).toBeInTheDocument();
    });

    // Default: Spells view is active
    expect(screen.getByPlaceholderText(/Search spells/i)).toBeInTheDocument();

    // Toggle to Character Sheet
    const sheetTab = screen.getByRole('button', { name: /Character Sheet/i });
    fireEvent.click(sheetTab);

    // Character Sheet elements should now be visible and left character accordion expanded
    expect(screen.getByText('Combat Stats')).toBeInTheDocument();
    expect(screen.getByText('Ability Scores & Saving Throws')).toBeInTheDocument();
    const leftHeaderAccordion = screen.getByTestId('left-character-header-accordion');
    expect(leftHeaderAccordion).toHaveClass('grid-rows-[1fr]', 'opacity-100');

    // Toggle back to Spell Library
    const grimoireTab = screen.getByRole('button', { name: /Spell Library/i });
    fireEvent.click(grimoireTab);

    // Left character accordion animates closed (with 300ms transition when at top)
    expect(leftHeaderAccordion).toHaveClass('grid-rows-[0fr]', 'opacity-0', 'duration-300');
    expect(screen.getByPlaceholderText(/Search spells/i)).toBeInTheDocument();

    // Toggle back to Character Sheet, scroll halfway through header, then switch back to Spell Library
    fireEvent.click(sheetTab);
    const sheetScroll = leftHeaderAccordion.parentElement;
    Object.defineProperty(sheetScroll, 'scrollTop', { value: 60, writable: true });
    fireEvent.scroll(sheetScroll);

    fireEvent.click(grimoireTab);
    expect(leftHeaderAccordion).toHaveClass('grid-rows-[0fr]', 'opacity-0', 'duration-300');
    expect(leftHeaderAccordion).toHaveStyle({ marginTop: '-60px' });

    // Simulate browser firing synthetic scrollTop=0 when overflow-y-auto is removed
    sheetScroll.scrollTop = 0;
    fireEvent.scroll(sheetScroll);

    // Toggle back to Character Sheet: restores halfway scrollTop (60) immediately
    fireEvent.click(sheetTab);
    expect(sheetScroll.scrollTop).toBe(60);
    expect(leftHeaderAccordion).toHaveClass('grid-rows-[1fr]', 'opacity-100', 'duration-0');

    Object.defineProperty(sheetScroll, 'scrollTop', { value: 500, writable: true });
    fireEvent.scroll(sheetScroll);

    fireEvent.click(grimoireTab);
    expect(leftHeaderAccordion).toHaveClass('grid-rows-[0fr]', 'opacity-0', 'duration-0');

    // Simulate browser resetting scrollTop when overflow-y-auto was removed
    sheetScroll.scrollTop = 0;

    // Toggle back to Character Sheet: restores previous scrollTop (500)
    fireEvent.click(sheetTab);
    expect(sheetScroll.scrollTop).toBe(500);
  });

  it('renders a spinning Mythallar logo during spell catalog loading', () => {
    // Keep fetch unresolved
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<App />);

    expect(screen.getByText('Loading spell grimoire...')).toBeInTheDocument();
    const spinner = screen.getByRole('img', { name: 'Loading Grimoire' });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('bg-dnd-gold');
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

  it('makes newly added max slots empty, and eats empty slots from the right when reducing max slots', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Magic Missile')).toBeInTheDocument();
    });

    // Cast Magic Missile so 1 of 2 slots is used (1 remaining, 1 empty)
    fireEvent.click(screen.getByText('Magic Missile'));
    const addBtns = await screen.findAllByRole('button', { name: /Add to Spellbook/i });
    fireEvent.click(addBtns[0]);
    fireEvent.click(await screen.findByLabelText(/Finish copying Magic Missile/i));
    fireEvent.click(screen.getByLabelText(/Click again to finish copying Magic Missile/i));
    fireEvent.click(await screen.findByLabelText(/Quick-Cast Magic Missile/i));

    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });

    // Open max slot editing
    fireEvent.click(screen.getByRole('button', { name: /Edit maximum spell slots/i }));

    // 1. Add 1 slot: Max increases from 2 to 3. New slot is empty, so remaining stays 1 (1 / 3)
    fireEvent.click(screen.getByLabelText(/Increase max 1st Level slots/i));
    expect(screen.getByText('1 /')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /^Max 1st Level slots$/i }).value).toBe('3');

    // 2. Reduce 1 slot: Max decreases from 3 to 2. Eats empty slot from right, so remaining stays 1 (1 / 2)
    fireEvent.click(screen.getByLabelText(/Decrease max 1st Level slots/i));
    expect(screen.getByText('1 /')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /^Max 1st Level slots$/i }).value).toBe('2');

    // 3. Reduce another slot: Max decreases from 2 to 1. Eats the remaining empty slot, so remaining stays 1 (1 / 1)
    fireEvent.click(screen.getByLabelText(/Decrease max 1st Level slots/i));
    expect(screen.getByText('1 /')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /^Max 1st Level slots$/i }).value).toBe('1');

    // 4. Reduce below remaining: Max decreases from 1 to 0. Now remaining must cap at 0 (0 / 0)
    fireEvent.click(screen.getByLabelText(/Decrease max 1st Level slots/i));
    const level1Row = screen.getByRole('spinbutton', { name: /^Max 1st Level slots$/i }).closest('div.rounded-lg');
    expect(level1Row).toHaveTextContent('0 /');
    expect(screen.getByRole('spinbutton', { name: /^Max 1st Level slots$/i }).value).toBe('0');

    // 5. Increase back to 1: Was filled before (baseline had 1 available), so slot is restored as filled (1 / 1)
    fireEvent.click(screen.getByLabelText(/Increase max 1st Level slots/i));
    expect(level1Row).toHaveTextContent('1 /');
    expect(screen.getByRole('spinbutton', { name: /^Max 1st Level slots$/i }).value).toBe('1');

    // 6. Increase to 2: 2nd slot was empty before, stays empty (1 / 2)
    fireEvent.click(screen.getByLabelText(/Increase max 1st Level slots/i));
    expect(level1Row).toHaveTextContent('1 /');
    expect(screen.getByRole('spinbutton', { name: /^Max 1st Level slots$/i }).value).toBe('2');

    // 7. Click Done to close editing session
    fireEvent.click(screen.getByRole('button', { name: /Done editing max slots/i }));
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
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

  it('skips copying state when skipCopying setting is enabled', async () => {
    localStorage.setItem('dnd_spellbook_settings', JSON.stringify({ skipCopying: true }));
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Magic Missile')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Magic Missile'));
    const addBtns = await screen.findAllByRole('button', { name: /Add to Spellbook/i });
    fireEvent.click(addBtns[0]);

    // Added directly ready without copying state
    expect(await screen.findByLabelText(/Toggle Prepared for Magic Missile/i)).toBeInTheDocument();
    expect(screen.queryByText('Copying')).not.toBeInTheDocument();
  });

  it('starts with no character and prompts creation when storage is empty', async () => {
    localStorage.clear();
    render(<App />);

    expect(await screen.findByText('No Character Selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create First Character/i })).toBeInTheDocument();

    // Renders MythallarLogo with color matching the text (bg-dnd-ivory) in empty container, sized ~15% larger
    const emptyStateContainer = screen.getByText('No Character Selected').closest('div');
    const logo = emptyStateContainer.parentElement.querySelector('div[role="img"][aria-label="Mythallar Logo"]');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('bg-dnd-ivory');
    expect(logo).toHaveClass('w-11', 'h-11');

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

  it('switches background texture overlay based on selected theme', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Fireball')).toBeInTheDocument();
    });

    // The Weave (default) has celestial texture overlay
    expect(container.querySelector('[data-testid="theme-bg-celestial"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="theme-bg-stars"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="theme-bg-limewash"]')).not.toBeInTheDocument();

    // Open Settings & Themes modal
    fireEvent.click(screen.getByRole('button', { name: /Open settings/i }));

    // Select Space Cadet -> stars background
    fireEvent.click(screen.getByText('Space Cadet'));
    expect(container.querySelector('[data-testid="theme-bg-stars"]')).toBeInTheDocument();

    // Select Desert Dunes -> limewash background
    fireEvent.click(screen.getByText('Desert Dunes'));
    expect(container.querySelector('[data-testid="theme-bg-limewash"]')).toBeInTheDocument();

    // Select Mythallar Classic -> clean legacy UI (no texture)
    fireEvent.click(screen.getByText('Mythallar Classic'));
    expect(container.querySelector('[data-testid="theme-bg-celestial"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="theme-bg-stars"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="theme-bg-limewash"]')).not.toBeInTheDocument();

    // Select The Weave -> celestial background restored
    fireEvent.click(screen.getByText('The Weave'));
    expect(container.querySelector('[data-testid="theme-bg-celestial"]')).toBeInTheDocument();
  });

  it('opens Short Rest modal, allows rolling hit dice to restore HP, and completes rest', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Fireball')).toBeInTheDocument();
    });

    // Switch to sheet view
    fireEvent.click(screen.getByRole('button', { name: /Character Sheet/i }));

    // Damage character HP first
    const dmgInput = screen.getByLabelText('Amount');
    fireEvent.change(dmgInput, { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Damage' }));

    // Click Short Rest button
    const restBtn = screen.getByRole('button', { name: 'Short Rest' });
    fireEvent.click(restBtn);

    // Short Rest modal is open
    expect(screen.getByRole('heading', { name: /Short Rest/i })).toBeInTheDocument();

    // Roll hit die
    const rollBtn = screen.getByRole('button', { name: /Roll 1d6/i });
    fireEvent.click(rollBtn);

    // Finish Short Rest
    const finishBtn = screen.getByRole('button', { name: /Finish Short Rest/i });
    fireEvent.click(finishBtn);

    // Modal closed
    expect(screen.queryByRole('heading', { name: /Short Rest/i })).not.toBeInTheDocument();
  });

  it('recovers spent hit dice and restores full HP on Long Rest', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Fireball')).toBeInTheDocument();
    });

    // Switch to sheet view
    fireEvent.click(screen.getByRole('button', { name: /Character Sheet/i }));

    // Damage HP
    const dmgInput = screen.getByLabelText('Amount');
    fireEvent.change(dmgInput, { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Damage' }));

    // Spend a hit die manually
    const spendBtn = screen.getByLabelText(/Spend d6 Hit Die/i);
    fireEvent.click(spendBtn);

    // Trigger Long Rest
    const longRestBtn = screen.getByRole('button', { name: /Long Rest/i });
    fireEvent.click(longRestBtn);
    const confirmBtn = screen.getByLabelText(/Confirm Long Rest/i);
    fireEvent.click(confirmBtn);

    // Current HP should be fully restored
    const hpInput = screen.getByLabelText('Current HP');
    expect(hpInput.value).toBe('10');
  });

  it('renders AuthStatus in branding header and morphs view switcher and AuthStatus on desktop hover', async () => {
    // Mock matchMedia for (hover: hover)
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(hover: hover)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Fireball')).toBeInTheDocument();
    });

    // Auth status is in header next to version
    const authBtn = screen.getByRole('button', { name: /Sign in with Google/i });
    expect(authBtn).toBeInTheDocument();

    const grimoireBtn = screen.getByRole('button', { name: 'Spell Library' });
    const switcherContainer = grimoireBtn.parentElement;

    // Initially switcher labels are collapsed (max-w-0, opacity-0)
    const grimoireLabel = grimoireBtn.querySelector('span');
    expect(grimoireLabel).toHaveClass('max-w-0', 'opacity-0');

    // Desktop hover over switcher
    fireEvent.mouseEnter(switcherContainer);

    // Switcher labels expand
    expect(grimoireLabel).toHaveClass('max-w-[120px]', 'opacity-100');

    // AuthStatus text collapses
    const authLabel = authBtn.querySelector('span.transition-all');
    expect(authLabel).toHaveClass('max-w-0', 'opacity-0');

    // Desktop mouse leave
    fireEvent.mouseLeave(switcherContainer);

    // Switcher labels collapse back
    expect(grimoireLabel).toHaveClass('max-w-0', 'opacity-0');

    // AuthStatus text re-expands
    expect(authLabel).toHaveClass('opacity-100');
  });

  it('makes the entire right pane scrollable as a unified container', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Fireball')).toBeInTheDocument();
    });

    const rightScroll = container.querySelector('[data-testid="right-pane-scroll"]');
    expect(rightScroll).toBeInTheDocument();
    expect(rightScroll).toHaveClass('overflow-y-auto');

    // CharacterHeader, SpellSlotTracker, and SpellbookView all live inside the single scrollable right pane
    const dropzone = screen.getByTestId('spellbook-dropzone');
    expect(rightScroll.contains(dropzone)).toBe(true);
    expect(dropzone).toHaveClass('shrink-0', 'transition-[height]');
    expect(dropzone).toHaveAttribute('data-collapsed', 'false');
    expect(dropzone.style.height).toBe('max(100%, 75vh)');
    expect(dropzone.querySelector('.overflow-y-auto')).toBeInTheDocument();
  });

  it('shows scrollbar class on scroll and hides it after 3 seconds of inactivity', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Fireball')).toBeInTheDocument();
    });

    vi.useFakeTimers();
    try {
      const rightScroll = container.querySelector('[data-testid="right-pane-scroll"]');
      expect(rightScroll).not.toHaveClass('is-scrolling');

      fireEvent.scroll(rightScroll);
      expect(rightScroll).toHaveClass('is-scrolling');

      act(() => {
        vi.advanceTimersByTime(2999);
      });
      expect(rightScroll).toHaveClass('is-scrolling');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(rightScroll).not.toHaveClass('is-scrolling');
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps static state on touch devices without sticky hover artifacts', async () => {
    // Mock touch device: (hover: none)
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Fireball')).toBeInTheDocument();
    });

    const grimoireBtn = screen.getByRole('button', { name: 'Spell Library' });
    const switcherContainer = grimoireBtn.parentElement;
    const grimoireLabel = grimoireBtn.querySelector('span');
    const authBtn = screen.getByRole('button', { name: /Sign in with Google/i });
    const authLabel = authBtn.querySelector('span.transition-all');

    // Trigger tap / touch mouseEnter
    fireEvent.mouseEnter(switcherContainer);

    // Remains collapsed because (hover: hover) is false
    expect(grimoireLabel).toHaveClass('max-w-0', 'opacity-0');
    expect(authLabel).toHaveClass('opacity-100');
  });
});
