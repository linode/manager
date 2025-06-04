import * as React from 'react';

import { accountSettingsFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { MaintenancePolicy } from './MaintenancePolicy';

describe('MaintenancePolicy', () => {
  it('renders the MaintenancePolicy section', () => {
    const { getByText } = renderWithTheme(<MaintenancePolicy />);

    expect(getByText('Host Maintenance Policy')).toBeVisible();
    expect(getByText('Maintenance Policy')).toBeVisible();
    expect(getByText('Save Maintenance Policy')).toBeVisible();
  });

  it('populates select with the returned maintenance_policy_id value', async () => {
    const accountSettings = accountSettingsFactory.build({
      maintenance_policy_id: 2,
    });

    server.use(
      http.get('*/v4/account/settings', () =>
        HttpResponse.json(accountSettings)
      )
    );

    const { findByDisplayValue } = renderWithTheme(<MaintenancePolicy />);

    await findByDisplayValue('Power Off / Power On');
  });
});
