import userEvent from '@testing-library/user-event';
import React from 'react';

import { firewallFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { FirewallSelect } from './FirewallSelect';

describe('FirewallSelect', () => {
  it('renders a default label', () => {
    const { getByText } = renderWithTheme(<FirewallSelect value={null} />);

    expect(getByText('Firewall')).toBeVisible();
  });

  it('renders a custom label', () => {
    const { getByText } = renderWithTheme(
      <FirewallSelect label="Assign Firewall" value={null} />
    );

    expect(getByText('Assign Firewall')).toBeVisible();
  });

  it('renders an error', () => {
    const { getByText } = renderWithTheme(
      <FirewallSelect errorText="Firewall is required." value={null} />
    );

    expect(getByText('Firewall is required.')).toBeVisible();
  });

  it('renders firewalls returned by the API', async () => {
    const firewalls = firewallFactory.buildList(3);

    server.use(
      http.get('*/v4/networking/firewalls', () => {
        return HttpResponse.json(makeResourcePage(firewalls));
      })
    );

    const { getByLabelText, getByText } = renderWithTheme(
      <FirewallSelect value={null} />
    );

    await userEvent.click(getByLabelText('Firewall'));

    for (const firewall of firewalls) {
      expect(getByText(firewall.label)).toBeVisible();
    }
  });
});
