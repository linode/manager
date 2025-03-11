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
    const { getAllByText, getByTestId, getByText } = renderWithTheme(
      <DefaultFirewalls />
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(getByText('Default Firewalls')).toBeVisible();
    expect(
      getByText('Linodes - Configuration Profile Interfaces')
    ).toBeVisible();
    expect(getByText('All')).toBeVisible();
    expect(getByText('Linodes - Linode Interfaces')).toBeVisible();
    expect(getByText('Public Interface')).toBeVisible();
    expect(getByText('VPC Interface')).toBeVisible();
    expect(getAllByText('NodeBalancers')).toHaveLength(2);
    expect(getByText('Save')).toBeVisible();
  });
});
