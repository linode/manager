import userEvent from '@testing-library/user-event';
import React from 'react';

import { firewallFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { FirewallSelect } from './FirewallSelect';

const NO_FIREWALL_ID = -1;
const NO_FIREWALL_LABEL =
  'No firewall - traffic is unprotected (not recommended)';

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

  it('renders "No firewall" option in the dropdown by default', async () => {
    const firewalls = firewallFactory.buildList(2);

    server.use(
      http.get('*/v4/networking/firewalls', () => {
        return HttpResponse.json(makeResourcePage(firewalls));
      })
    );

    const { getByLabelText, getByText } = renderWithTheme(
      <FirewallSelect value={null} />
    );

    await userEvent.click(getByLabelText('Firewall'));

    expect(getByText(NO_FIREWALL_LABEL)).toBeVisible();
  });

  it('does not render "No firewall" option when showNoFirewallOption is false', async () => {
    const firewalls = firewallFactory.buildList(2);

    server.use(
      http.get('*/v4/networking/firewalls', () => {
        return HttpResponse.json(makeResourcePage(firewalls));
      })
    );

    const { getByLabelText, queryByText } = renderWithTheme(
      <FirewallSelect showNoFirewallOption={false} value={null} />
    );

    await userEvent.click(getByLabelText('Firewall'));

    expect(queryByText(NO_FIREWALL_LABEL)).not.toBeInTheDocument();
  });

  it('displays warning notice when "No firewall" is selected and warningMessageForNoFirewallOption is provided', () => {
    const warningMessage = 'This Linode is not secured with a Cloud Firewall.';

    const { getByText } = renderWithTheme(
      <FirewallSelect
        value={NO_FIREWALL_ID}
        warningMessageForNoFirewallOption={warningMessage}
      />
    );

    expect(getByText(warningMessage)).toBeVisible();
  });

  it('does not display warning notice when "No firewall" is selected but warningMessageForNoFirewallOption is not provided', () => {
    const { queryByRole } = renderWithTheme(
      <FirewallSelect value={NO_FIREWALL_ID} />
    );

    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows "No firewall" as selected when value is NO_FIREWALL_ID', async () => {
    server.use(
      http.get('*/v4/networking/firewalls', () => {
        return HttpResponse.json(makeResourcePage([]));
      })
    );

    const { findByDisplayValue } = renderWithTheme(
      <FirewallSelect value={NO_FIREWALL_ID} />
    );

    expect(await findByDisplayValue(NO_FIREWALL_LABEL)).toBeInTheDocument();
  });
});
