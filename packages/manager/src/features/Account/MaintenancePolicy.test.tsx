import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { accountSettingsFactory } from 'src/factories';
import { maintenancePolicyFactory } from 'src/factories/maintenancePolicy';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { MaintenancePolicy } from './MaintenancePolicy';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: { update_account_settings: true },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));
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
        slug: 'linode/power_off_on',
      }),
      maintenancePolicyFactory.build({
        label: 'Migrate',
        slug: 'linode/migrate',
      }),
    ];
    const accountSettings = accountSettingsFactory.build({
      maintenance_policy: 'linode/power_off_on',
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

  it('should disable "Save Maintenance Policy" button and the selectbox if the user does not have "update_account_settings" permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: { update_account_settings: false },
    });
    const { getByText, getByLabelText } = renderWithTheme(
      <MaintenancePolicy />
    );

    expect(getByLabelText('Maintenance Policy')).toHaveAttribute('disabled');
    expect(getByText('Save Maintenance Policy')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});
