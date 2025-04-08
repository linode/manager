import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { firewallFactory, firewallSettingsFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DefaultFirewalls } from './DefaultFirewalls';

const loadingTestId = 'circle-progress';

describe('NetworkInterfaces', () => {
  it('renders the NetworkInterfaces accordion', async () => {
    server.use(
      http.get('*/v4beta/networking/firewalls/settings', () =>
        HttpResponse.json(firewallSettingsFactory.build())
      ),
      http.get('*/v4beta/networking/firewalls', () =>
        HttpResponse.json(makeResourcePage(firewallFactory.buildList(1)))
      )
    );
    const { getByTestId, getByText } = renderWithTheme(<DefaultFirewalls />, {
      flags: { linodeInterfaces: { enabled: true } },
    });

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

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
