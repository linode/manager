import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { AuthenticationSettings } from './AuthenticationSettings';

vi.mock('libphonenumber-js', () => ({
  parsePhoneNumber: () => ({
    formatInternational: () => '',
  }),
}));

describe('Authentication settings profile tab', () => {
  it('should render text after loading', async () => {
    const { getByTestId, getByText } = await renderWithThemeAndRouter(
      <AuthenticationSettings />
    );

    await waitForElementToBeRemoved(getByTestId('circle-progress'));

    getByText('Security Settings');
  });
});
