import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('App', () => {
  it('renders application title', () => {
    render(<App />);
    expect(screen.getByText(/D&D 5e Spellbook/i)).toBeInTheDocument();
  });
});
