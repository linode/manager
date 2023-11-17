import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { Toggle } from './Toggle';

describe('Toggle component', () => {
  it('should not render a tooltip button', () => {
    const screen = renderWithTheme(<Toggle />);
    const tooltipButton = screen.queryByRole('button');
    expect(tooltipButton).not.toBeInTheDocument();
  });
  it('should render a tooltip button', async () => {
    const screen = renderWithTheme(
      <Toggle interactive={true} tooltipText={'some tooltip text'} />
    );
    const tooltipButton = screen.getByRole('button');
    expect(tooltipButton).toBeInTheDocument();
    fireEvent.mouseOver(tooltipButton);
    await waitFor(() => screen.findByRole('tooltip'));
    expect(screen.getByText('some tooltip text')).toBeVisible();
  });
});
