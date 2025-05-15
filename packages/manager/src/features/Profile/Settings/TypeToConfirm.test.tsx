import { waitFor } from '@testing-library/react';
import React from 'react';

import { preferencesFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { TypeToConfirm } from './TypeToConfirm';

describe('TypeToConfirm', () => {
  it('renders a heading', () => {
    const { getByText } = renderWithTheme(<TypeToConfirm />);

    expect(getByText('Type-to-Confirm')).toBeVisible();
  });

  it('is enabled by default if type_to_confirm in undefined/does not exist in user preferences', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () => HttpResponse.json({}))
    );

    const { getByRole, getByText } = renderWithTheme(<TypeToConfirm />);

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeEnabled();
    });

    expect(getByRole('checkbox')).toBeChecked();
    expect(getByText('Type-to-confirm is enabled')).toBeVisible();
  });

  it('is enabled if type_to_confirm in user preferences is true', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () =>
        HttpResponse.json(preferencesFactory.build({ type_to_confirm: true }))
      )
    );

    const { getByRole, getByText } = renderWithTheme(<TypeToConfirm />);

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeEnabled();
    });

    expect(getByRole('checkbox')).toBeChecked();
    expect(getByText('Type-to-confirm is enabled')).toBeVisible();
  });

  it('is disabled if type_to_confirm in user preferences is false', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () =>
        HttpResponse.json(preferencesFactory.build({ type_to_confirm: false }))
      )
    );

    const { getByRole, getByText } = renderWithTheme(<TypeToConfirm />);

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeEnabled();
    });

    expect(getByRole('checkbox')).not.toBeChecked();
    expect(getByText('Type-to-confirm is disabled')).toBeVisible();
  });
});
