import { act, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SuspenseLoader } from '../SuspenseLoader/SuspenseLoader';

const testId = 'circle-progress';

describe('SuspenseLoader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not render the spinner before the default delay', () => {
    renderWithTheme(<SuspenseLoader />);

    expect(screen.queryByTestId(testId)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(screen.queryByTestId(testId)).toBeNull();
  });

  it('renders the spinner after the default delay (300ms)', () => {
    renderWithTheme(<SuspenseLoader />);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('uses a custom delay', () => {
    renderWithTheme(<SuspenseLoader delay={500} />);

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(screen.queryByTestId(testId)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('clears the timer on unmount so the spinner does not appear after delay', () => {
    const { unmount } = renderWithTheme(<SuspenseLoader />);

    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByTestId(testId)).toBeNull();
  });
});
