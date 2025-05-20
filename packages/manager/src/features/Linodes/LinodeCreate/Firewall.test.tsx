import { waitFor } from '@testing-library/react';
import React from 'react';

import { firewallFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Firewall } from './Firewall';

import type { CreateLinodeRequest } from '@linode/api-v4';

describe('Linode Create Firewall', () => {
  it('should render a header', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Firewall />,
    });

    const heading = getByText('Firewall');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('should render a Firewall select', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <Firewall />,
    });

    const firewallSelect = getByLabelText('Assign Firewall');

    expect(firewallSelect).toBeVisible();
    expect(firewallSelect).toBeEnabled();
  });

  it('should render a "Create Firewall" button', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Firewall />,
    });

    const createFirewallButton = getByText('Create Firewall');

    expect(createFirewallButton).toBeVisible();
    expect(createFirewallButton).toBeEnabled();
  });

  it('should populate the select based on form data and the firewall API response', async () => {
    const firewall = firewallFactory.build();

    server.use(
      http.get('*/v4/firewalls', () => {
        return HttpResponse.json(makeResourcePage([firewall]));
      })
    );

    const { getByLabelText } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <Firewall />,
        useFormOptions: { defaultValues: { firewall_id: firewall.id } },
      });

    await waitFor(
      () => {
        expect(getByLabelText('Assign Firewall')).toHaveDisplayValue(
          firewall.label
        );
      },
      { timeout: 5_000 }
    );
  });
});
