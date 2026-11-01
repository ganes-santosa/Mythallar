import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Shield } from 'lucide-react';
import AccordionSection from './AccordionSection';

describe('AccordionSection', () => {
  it('renders section title, icon, and content', () => {
    render(
      <AccordionSection title="Combat Vitals" icon={Shield} defaultOpen={true}>
        <div>Vitals Content</div>
      </AccordionSection>
    );

    expect(screen.getByText('Combat Vitals')).toBeInTheDocument();
    expect(screen.getByText('Vitals Content')).toBeInTheDocument();
  });

  it('toggles collapse state when header is clicked', () => {
    render(
      <AccordionSection title="Skills & Senses" icon={Shield} defaultOpen={true}>
        <div>Skills List</div>
      </AccordionSection>
    );

    const toggleBtn = screen.getByLabelText('Collapse Skills & Senses');
    fireEvent.click(toggleBtn);

    expect(screen.getByLabelText('Expand Skills & Senses')).toBeInTheDocument();
  });

  it('renders optional header actions or badges', () => {
    render(
      <AccordionSection
        title="Spell Slots"
        icon={Shield}
        badge={<span data-testid="test-badge">4 / 4</span>}
        actions={<button type="button">Rest</button>}
      >
        <div>Slot Grid</div>
      </AccordionSection>
    );

    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rest' })).toBeInTheDocument();
  });
});
