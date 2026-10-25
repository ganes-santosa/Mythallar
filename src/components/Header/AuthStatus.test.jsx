import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import AuthStatus from './AuthStatus';

describe('AuthStatus component', () => {
  it('renders Google sign in button when user is null', () => {
    const handleSignIn = vi.fn();
    render(<AuthStatus user={null} syncStatus="idle" onSignIn={handleSignIn} onSignOut={vi.fn()} />);

    const signInBtn = screen.getByRole('button', { name: /sign in/i });
    expect(signInBtn).toBeInTheDocument();
    fireEvent.click(signInBtn);
    expect(handleSignIn).toHaveBeenCalled();
  });

  it('renders user email and sync indicator when logged in', () => {
    const mockUser = {
      id: 'u1',
      email: 'mordenkainen@faerun.org',
      user_metadata: { full_name: 'Mordenkainen' },
    };

    render(
      <AuthStatus
        user={mockUser}
        syncStatus="saved"
        onSignIn={vi.fn()}
        onSignOut={vi.fn()}
        onSyncNow={vi.fn()}
      />
    );

    expect(screen.getByText(/mordenkainen/i)).toBeInTheDocument();
  });

  it('allows user to sign out via dropdown', () => {
    const mockUser = {
      id: 'u1',
      email: 'mordenkainen@faerun.org',
    };
    const handleSignOut = vi.fn();

    render(
      <AuthStatus
        user={mockUser}
        syncStatus="saved"
        onSignIn={vi.fn()}
        onSignOut={handleSignOut}
      />
    );

    const userTrigger = screen.getByRole('button', { name: /mordenkainen@faerun.org/i });
    fireEvent.click(userTrigger);

    const signOutBtn = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutBtn);

    expect(handleSignOut).toHaveBeenCalled();
  });
});
