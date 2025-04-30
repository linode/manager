import * as React from 'react';

import {
  accountFactory,
  firewallFactory,
  firewallSettingsFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DefaultFirewalls } from './DefaultFirewalls';

describe('NetworkInterfaces', () => {
  it('renders the NetworkInterfaces section', async () => {
    const account = accountFactory.build({
      capabilities: ['Linode Interfaces'],
    });

    server.use(
      http.get('*/v4/account', () => HttpResponse.json(account)),
      http.get('*/v4beta/networking/firewalls/settings', () =>
        HttpResponse.json(firewallSettingsFactory.build())
      ),
      http.get('*/v4beta/networking/firewalls', () =>
        HttpResponse.json(makeResourcePage(firewallFactory.buildList(1)))
      )
    );

    const { findByText, getByText } = renderWithTheme(<DefaultFirewalls />, {
      flags: { linodeInterfaces: { enabled: true } },
    });

    const title = await findByText('Default Firewalls');

    expect(title).toBeVisible();

    expect(getByText('Default Firewalls')).toBeVisible();
    expect(getByText('Linodes')).toBeVisible();
    expect(
      getByText('Configuration Profile Interfaces Firewall')
    ).toBeVisible();
    expect(
      getByText('Linode Interfaces - Public Interface Firewall')
    ).toBeVisible();
    expect(
      getByText('Linode Interfaces - VPC Interface Firewall')
    ).toBeVisible();
    expect(getByText('NodeBalancers')).toBeVisible();
    expect(getByText('NodeBalancers Firewall')).toBeVisible();
    expect(getByText('Save')).toBeVisible();
  });
});
