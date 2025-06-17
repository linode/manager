import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { accountSettingsFactory } from 'src/factories';
import { maintenancePolicyFactory } from 'src/factories/maintenancePolicy';
import { makeResourcePage } from 'src/mocks/serverHandlers';
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

  it("populates select with the account's default maintenance_policy value", async () => {
    const policies = [
      maintenancePolicyFactory.build({
        label: 'Power Off / Power On',
        slug: 'power_off_on',
      }),
      maintenancePolicyFactory.build({ label: 'Migrate', slug: 'migrate' }),
    ];
    const accountSettings = accountSettingsFactory.build({
      maintenance_policy: 'power_off_on',
    });

    server.use(
      http.get('*/maintenance/policies', () => {
        return HttpResponse.json(makeResourcePage(policies));
      }),
      http.get('*/account/settings', () => {
        return HttpResponse.json(accountSettings);
      })
    );

    const { getByLabelText } = renderWithTheme(<MaintenancePolicy />);

    await waitFor(() => {
      expect(getByLabelText('Maintenance Policy')).toHaveDisplayValue(
        'Power Off / Power On'
      );
    });
  });
});
