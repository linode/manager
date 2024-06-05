import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CircleProgress } from './CircleProgress';

const CONTENT_LOADING = 'Content is loading';

describe('CircleProgress', () => {
  it('renders a CircleProgress properly', () => {
    const screen = renderWithTheme(<CircleProgress />);

    const circleProgress = screen.getByLabelText(CONTENT_LOADING);
    expect(circleProgress).toBeVisible();
    const circle = screen.getByTestId('circle-progress');
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveStyle('width: 124px; height: 124px;');
  });

  it('renders a small CircleProgress', () => {
    const screen = renderWithTheme(<CircleProgress size="sm" />);

    const circleProgress = screen.getByLabelText(CONTENT_LOADING);
    expect(circleProgress).toBeVisible();
    expect(circleProgress).toHaveStyle('width: 40px; height: 40px;');
  });

  it('sets a small CircleProgress with no padding', () => {
    const screen = renderWithTheme(<CircleProgress noPadding size="sm" />);

    const circleProgress = screen.getByLabelText(CONTENT_LOADING);
    expect(circleProgress).toBeVisible();
    expect(circleProgress).toHaveStyle('width: 20px; height: 20px;');
  });
});
