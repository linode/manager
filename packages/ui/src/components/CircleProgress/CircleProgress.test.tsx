import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { CircleProgress } from './CircleProgress';

const CONTENT_LOADING = 'Content is loading';

describe('CircleProgress', () => {
  it('renders a CircleProgress properly', () => {
    const screen = render(<CircleProgress />);

    const circleProgress = screen.getByLabelText(CONTENT_LOADING);
    expect(circleProgress).toBeVisible();
    const circle = screen.getByTestId('circle-progress');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveStyle('width: 124px; height: 124px;');
  });

  it('renders a small CircleProgress', () => {
    const screen = render(<CircleProgress size="sm" />);

    const circleProgress = screen.getByLabelText(CONTENT_LOADING);
    expect(circleProgress).toBeVisible();
    expect(circleProgress).toHaveStyle('width: 40px; height: 40px;');
  });

  it('sets a small CircleProgress with no padding', () => {
    const screen = render(<CircleProgress noPadding size="sm" />);

    const circleProgress = screen.getByLabelText(CONTENT_LOADING);
    expect(circleProgress).toBeVisible();
    expect(circleProgress).toHaveStyle('width: 20px; height: 20px;');
  });
});
