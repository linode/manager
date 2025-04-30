import * as React from 'react';

import { accountSettingsFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NetworkInterfaceType } from './NetworkInterfaceType';

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
      http.get('*/v4/account/settings', () =>
        HttpResponse.json(accountSettings)
      )
    );

    const { findByDisplayValue } = renderWithTheme(<NetworkInterfaceType />);

    await findByDisplayValue('Linode Interfaces Only');
  });
});
