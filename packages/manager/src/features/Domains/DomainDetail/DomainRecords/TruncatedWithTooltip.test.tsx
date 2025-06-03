import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { TruncatedWithTooltip } from './TruncatedWithTooltip';

describe('TruncatedWithTooltip', () => {
  it('renders the full text when it does not exceed maxLength', () => {
    renderWithThemeAndRouter(
      <TruncatedWithTooltip maxLength={20} text="Short text" />
    );
    expect(screen.getByText('Short text')).toBeInTheDocument();
  });

  it('renders truncated text when it exceeds maxLength', () => {
    const longText = 'This is a long string that needs to be truncated.';
    renderWithThemeAndRouter(
      <TruncatedWithTooltip maxLength={10} text={longText} />
    );
    expect(screen.getByText('This is a …')).toBeInTheDocument();
  });

  it('shows the full text in tooltip when text is truncated', async () => {
    const user = userEvent.setup();
    const longText = 'Another example of a long string needing truncation.';
    renderWithThemeAndRouter(
      <TruncatedWithTooltip maxLength={10} text={longText} />
    );

    await user.hover(screen.getByText('Another ex…'));

    // Tooltip appears in the DOM after hover
    expect(await screen.findByRole('tooltip')).toHaveTextContent(longText);
  });

  it('does not show a tooltip if text is short enough', () => {
    renderWithThemeAndRouter(
      <TruncatedWithTooltip maxLength={10} text="Exact" />
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
