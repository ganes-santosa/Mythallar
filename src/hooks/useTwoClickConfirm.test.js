import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useTwoClickConfirm from './useTwoClickConfirm';

describe('useTwoClickConfirm', () => {
  it('arms first, invokes action second, and resets after three seconds', () => {
    vi.useFakeTimers();
    const action = vi.fn();
    const { result } = renderHook(() => useTwoClickConfirm(action));

    act(() => result.current.handleClick());
    expect(result.current.armed).toBe(true);
    expect(action).not.toHaveBeenCalled();

    act(() => result.current.handleClick());
    expect(action).toHaveBeenCalledOnce();
    expect(result.current.armed).toBe(false);

    act(() => result.current.handleClick());
    act(() => vi.advanceTimersByTime(2999));
    expect(result.current.armed).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.armed).toBe(false);
    vi.useRealTimers();
  });
});
