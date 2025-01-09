import { waitFor } from '@testing-library/react';
import React from 'react';

import { preferencesFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Theme } from './Theme';

describe('Theme', () => {
  it('renders a heading', () => {
    const { getByText } = renderWithTheme(<Theme />);

    expect(getByText('Theme')).toBeVisible();
  });

  it('defaults to "system" if there is no theme stored in preferences', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () => HttpResponse.json({}))
    );

    const { getByLabelText } = renderWithTheme(<Theme />);

    await waitFor(() => {
      expect(getByLabelText('System')).toBeChecked();
    });
  });

  it('checks "System" if the theme stored in preferences is "system"', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () =>
        HttpResponse.json(preferencesFactory.build({ theme: 'system' }))
      )
    );

    const { getByLabelText } = renderWithTheme(<Theme />);

    await waitFor(() => {
      expect(getByLabelText('System')).toBeChecked();
    });
  });

  it('checks "light" if the theme stored in preferences is "light"', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () =>
        HttpResponse.json(preferencesFactory.build({ theme: 'light' }))
      )
    );

    const { getByLabelText } = renderWithTheme(<Theme />);

    await waitFor(() => {
      expect(getByLabelText('Light')).toBeChecked();
    });
  });

  it('checks "dark" if the theme stored in preferences is "dark"', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () =>
        HttpResponse.json(preferencesFactory.build({ theme: 'dark' }))
      )
    );

    const { getByLabelText } = renderWithTheme(<Theme />);

    await waitFor(() => {
      expect(getByLabelText('Dark')).toBeChecked();
    });
  });
});
