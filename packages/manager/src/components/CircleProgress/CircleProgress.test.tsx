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
    const innerCircle = screen.getByTestId('inner-circle-progress');
    expect(innerCircle).toBeInTheDocument();
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

  it('renders a CircleProgress without the inner circle', () => {
    const screen = renderWithTheme(<CircleProgress noInner />);

    const circleProgress = screen.getByLabelText(CONTENT_LOADING);
    expect(circleProgress).toBeVisible();
    const innerCircle = screen.queryByTestId('inner-circle-progress');
    expect(innerCircle).not.toBeInTheDocument();
  });
});
