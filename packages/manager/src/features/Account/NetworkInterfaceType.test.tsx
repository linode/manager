import * as React from 'react';

import { accountSettingsFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NetworkInterfaceType } from './NetworkInterfaceType';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
  userPermissions: vi.fn(() => ({
    data: { update_account_settings: true },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));
describe('NetworkInterfaces', () => {
  it('renders the NetworkInterfaces section', () => {
    const { getByText } = renderWithTheme(<NetworkInterfaceType />);

    expect(getByText('Network Interface Type')).toBeVisible();
    expect(getByText('Interfaces for new Linodes')).toBeVisible();
    expect(getByText('Save')).toBeVisible();
  });

  it('populates select with the returned interfaces_for_new_linodes value', async () => {
    const accountSettings = accountSettingsFactory.build({
      interfaces_for_new_linodes: 'linode_only',
    });

    server.use(
      http.get('*/v4*/account/settings', () =>
        HttpResponse.json(accountSettings)
      )
    );

    const { findByDisplayValue } = renderWithTheme(<NetworkInterfaceType />);

    await findByDisplayValue('Linode Interfaces Only');
  });

  it('should disable "Save" button and the selectbox if the user does not have "update_account_settings" permission', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: { update_account_settings: false },
    });
    const { getByText, getByLabelText } = renderWithTheme(
      <NetworkInterfaceType />
    );

    expect(getByLabelText('Interfaces for new Linodes')).toHaveAttribute(
      'disabled'
    );
    expect(getByText('Save')).toHaveAttribute('aria-disabled', 'true');
  });
});
