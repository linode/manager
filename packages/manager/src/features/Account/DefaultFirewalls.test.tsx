import * as React from 'react';

import {
  accountFactory,
  firewallFactory,
  firewallSettingsFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DefaultFirewalls } from './DefaultFirewalls';

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
  it('renders the NetworkInterfaces section', async () => {
    const account = accountFactory.build({
      capabilities: ['Linode Interfaces'],
    });

    server.use(
      http.get('*/v4*/account', () => HttpResponse.json(account)),
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

  it('should disable Save button and all select boxes if the user does not have "update_account_settings" permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: { update_account_settings: false },
    });
    const account = accountFactory.build({
      capabilities: ['Linode Interfaces'],
    });

    server.use(
      http.get('*/v4*/account', () => HttpResponse.json(account)),
      http.get('*/v4beta/networking/firewalls/settings', () =>
        HttpResponse.json(firewallSettingsFactory.build())
      ),
      http.get('*/v4beta/networking/firewalls', () =>
        HttpResponse.json(makeResourcePage(firewallFactory.buildList(1)))
      )
    );

    const { getByLabelText, getByText } = renderWithTheme(
      <DefaultFirewalls />,
      {
        flags: { linodeInterfaces: { enabled: true } },
      }
    );

    const configurationSelect = getByLabelText(
      'Configuration Profile Interfaces Firewall'
    );
    expect(configurationSelect).toHaveAttribute('disabled');

    const linodePublicSelect = getByLabelText(
      'Linode Interfaces - Public Interface Firewall'
    );
    expect(linodePublicSelect).toHaveAttribute('disabled');

    const linodeVPCSelect = getByLabelText(
      'Linode Interfaces - VPC Interface Firewall'
    );
    expect(linodeVPCSelect).toHaveAttribute('disabled');

    const nodeBalancerSelect = getByLabelText('NodeBalancers Firewall');
    expect(nodeBalancerSelect).toHaveAttribute('disabled');

    expect(getByText('Save')).toHaveAttribute('aria-disabled', 'true');
  });
});
