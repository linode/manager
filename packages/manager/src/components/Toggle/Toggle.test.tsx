import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Toggle } from './Toggle';

describe('Toggle component', () => {
  it('should not render a tooltip button', () => {
    const screen = renderWithTheme(<Toggle />);
    const tooltipButton = screen.queryByRole('button');
    expect(tooltipButton).not.toBeInTheDocument();
  });
  it('should render a tooltip button', () => {
    const screen = renderWithTheme(
      <Toggle interactive={true} tooltipText={'test'} />
    );
    const tooltipButton = screen.getByRole('button');
    expect(tooltipButton).toBeInTheDocument();
  });
});
