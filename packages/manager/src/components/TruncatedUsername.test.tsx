import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TruncatedUsername } from './TruncatedUsername';

describe('TruncatedUsername', () => {
  it('should render the truncated username and tooltip if it exceeds the max length', async () => {
    const { getByText, getByRole } = renderWithTheme(
      <TruncatedUsername username="a-very-long-username-that-exceeds-thirty-two-characters" />
    );

    const text = getByText(/a-very-long-username-that-exc.../);

    expect(text).toBeInTheDocument();

    await userEvent.hover(text);

    await waitFor(() => {
      expect(getByRole('tooltip')).toBeInTheDocument();
    });

    expect(getByRole('tooltip')).toHaveTextContent(
      'a-very-long-username-that-exceeds-thirty-two-characters'
    );
  });

  it('should render the full username if it does not exceed the max length', () => {
    const { getByText, getByRole } = renderWithTheme(
      <TruncatedUsername username="short-username" />
    );
    expect(getByText('short-username')).toBeInTheDocument();
    expect(() => getByRole('tooltip')).toThrow();
  });
});
