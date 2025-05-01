import { profileFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Notifications } from './Notifications';

describe('Notifications', () => {
  it('renders a heading', () => {
    const { getByText } = renderWithTheme(<Notifications />);

    expect(getByText('Notifications')).toBeVisible();
  });

  it('is enabled if email_notifications is true', async () => {
    server.use(
      http.get('*/v4/profile', () =>
        HttpResponse.json(profileFactory.build({ email_notifications: true }))
      )
    );

    const { getByRole, getByText } = renderWithTheme(<Notifications />);

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeEnabled();
    });

    expect(getByRole('checkbox')).toBeChecked();
    expect(
      getByText('Email alerts for account activity are enabled')
    ).toBeVisible();
  });

  it('is disabled if email_notifications is false', async () => {
    server.use(
      http.get('*/v4/profile', () =>
        HttpResponse.json(profileFactory.build({ email_notifications: false }))
      )
    );

    const { getByRole, getByText } = renderWithTheme(<Notifications />);

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeEnabled();
    });

    expect(getByRole('checkbox')).not.toBeChecked();
    expect(
      getByText('Email alerts for account activity are disabled')
    ).toBeVisible();
  });
});
