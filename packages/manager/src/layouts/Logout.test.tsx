import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { getAuthToken, setAuthToken } from 'src/utilities/authentication';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Logout } from './Logout';

describe('Logout', () => {
  it('clears Auth token from local storage when mounted', async () => {
    const initialAuthToken = {
      expiration: 'never',
      scopes: '*',
      token: 'helloworld',
    };

    setAuthToken(initialAuthToken);

    expect(getAuthToken()).toEqual(initialAuthToken);

    renderWithTheme(<Logout />);

    await waitFor(() =>
      expect(getAuthToken()).toEqual({ expiration: '', scopes: '', token: '' })
    );
  });
});
