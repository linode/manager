import { waitFor } from '@testing-library/react';
import React from 'react';

import { preferencesFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { MaskSensitiveData } from './MaskSensitiveData';

describe('MaskSensitiveData', () => {
  it('renders a heading', () => {
    const { getByText } = renderWithTheme(<MaskSensitiveData />);

    expect(getByText('Mask Sensitive Data')).toBeVisible();
  });

  it('is enabled if maskSensitiveData in user preferences is true', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () =>
        HttpResponse.json(preferencesFactory.build({ maskSensitiveData: true }))
      )
    );

    const { getByRole, getByText } = renderWithTheme(<MaskSensitiveData />);

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeEnabled();
    });

    expect(getByRole('checkbox')).toBeChecked();
    expect(getByText('Sensitive data is masked')).toBeVisible();
  });

  it('is disabled if maskSensitiveData in user preferences is false', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () =>
        HttpResponse.json(
          preferencesFactory.build({ maskSensitiveData: false })
        )
      )
    );

    const { getByRole, getByText } = renderWithTheme(<MaskSensitiveData />);

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeEnabled();
    });

    expect(getByRole('checkbox')).not.toBeChecked();
    expect(getByText('Sensitive data is visible')).toBeVisible();
  });

  it('is disabled if maskSensitiveData in user preferences is undefined/does not exist', async () => {
    server.use(
      http.get('*/v4/profile/preferences', () => HttpResponse.json({}))
    );

    const { getByRole, getByText } = renderWithTheme(<MaskSensitiveData />);

    await waitFor(() => {
      expect(getByRole('checkbox')).toBeEnabled();
    });

    expect(getByRole('checkbox')).not.toBeChecked();
    expect(getByText('Sensitive data is visible')).toBeVisible();
  });
});
