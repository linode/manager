import * as React from 'react';

import { firewallFactory, firewallSettingsFactory } from 'src/factories';
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
    server.use(
      http.get('*/v4beta/networking/firewalls/settings', () =>
        HttpResponse.json(firewallSettingsFactory.build())
      ),
      http.get('*/v4beta/networking/firewalls', () =>
        HttpResponse.json(makeResourcePage(firewallFactory.buildList(1)))
      )
    );

    const { findByText } = renderWithTheme(<DefaultFirewalls />);

    const title = await findByText('Default Firewalls');

    expect(title).toBeVisible();
    expect(await findByText('Default Firewalls')).toBeVisible();
    expect(await findByText('Linodes')).toBeVisible();
    expect(
      await findByText('Configuration Profile Interfaces Firewall')
    ).toBeVisible();
    expect(
      await findByText('Linode Interfaces - Public Interface Firewall')
    ).toBeVisible();
    expect(
      await findByText('Linode Interfaces - VPC Interface Firewall')
    ).toBeVisible();
    expect(await findByText('NodeBalancers')).toBeVisible();
    expect(await findByText('NodeBalancers Firewall')).toBeVisible();
    expect(await findByText('Save')).toBeVisible();
  });

  it('should disable Save button and all select boxes if the user does not have "update_account_settings" permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: { update_account_settings: false },
    });

    server.use(
      http.get('*/v4beta/networking/firewalls/settings', () =>
        HttpResponse.json(firewallSettingsFactory.build())
      ),
      http.get('*/v4beta/networking/firewalls', () =>
        HttpResponse.json(makeResourcePage(firewallFactory.buildList(1)))
      )
    );

    const { findByLabelText, findByText } = renderWithTheme(
      <DefaultFirewalls />
    );

    await findByText('Default Firewalls');

    const configurationSelect = await findByLabelText(
      'Configuration Profile Interfaces Firewall'
    );
    expect(configurationSelect).toHaveAttribute('disabled');

    const linodePublicSelect = await findByLabelText(
      'Linode Interfaces - Public Interface Firewall'
    );
    expect(linodePublicSelect).toHaveAttribute('disabled');

    const linodeVPCSelect = await findByLabelText(
      'Linode Interfaces - VPC Interface Firewall'
    );
    expect(linodeVPCSelect).toHaveAttribute('disabled');

    const nodeBalancerSelect = await findByLabelText('NodeBalancers Firewall');
    expect(nodeBalancerSelect).toHaveAttribute('disabled');

    const saveButton = await findByText('Save');
    expect(saveButton).toHaveAttribute('aria-disabled', 'true');
  });
});
