import userEvent from '@testing-library/user-event';
import React from 'react';
import { act } from 'react-dom/test-utils';

import { firewallFactory, firewallTemplateFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { GenerateFirewallDialog } from './GenerateFirewallDialog';

describe('GenerateFirewallButton', () => {
  it('Can successfully generate a firewall', async () => {
    const firewalls = firewallFactory.buildList(2);
    const firewallTemplates = firewallTemplateFactory.buildList(2);
    const createFirewallCallback = vi.fn();
    const onClose = vi.fn();
    const onFirewallGenerated = vi.fn();

    server.use(
      http.get('*/v4beta/networking/firewalls', () => {
        return HttpResponse.json(makeResourcePage(firewalls));
      }),
      http.get('*/v4beta/networking/firewalls/templates', () => {
        return HttpResponse.json(makeResourcePage(firewallTemplates));
      }),
      http.post('*/v4beta/networking/firewalls', async ({ request }) => {
        const body = await request.json();
        const payload = body as any;
        const newFirewall = firewallFactory.build({
          label: payload.label ?? 'mock-firewall',
        });
        createFirewallCallback(newFirewall);
        return HttpResponse.json(newFirewall);
      })
    );

    const { findByText, getByText } = renderWithTheme(
      <GenerateFirewallDialog
        onClose={onClose}
        onFirewallGenerated={onFirewallGenerated}
        open
      />
    );

    getByText('Generate an Akamai Compliant Firewall');

    act(() => {
      userEvent.click(getByText('Generate Firewall Now'));
    });

    await findByText('Generating Firewall');

    await findByText('Complete!');

    expect(onFirewallGenerated).toHaveBeenCalledWith(
      expect.objectContaining({
        label: `${firewallTemplates[0].slug}-1`,
        rules: firewallTemplates[0].rules,
      })
    );

    expect(createFirewallCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        label: `${firewallTemplates[0].slug}-1`,
        rules: firewallTemplates[0].rules,
      })
    );
  });

  it('Handles errors gracefully', async () => {
    const firewalls = firewallFactory.buildList(2);
    const firewallTemplates = firewallTemplateFactory.buildList(2);
    const onClose = vi.fn();
    const onFirewallGenerated = vi.fn();

    server.use(
      http.get('*/v4beta/networking/firewalls', () => {
        return HttpResponse.json(makeResourcePage(firewalls));
      }),
      http.get('*/v4beta/networking/firewalls/templates', () => {
        return HttpResponse.json(makeResourcePage(firewallTemplates));
      }),
      http.post('*/v4beta/networking/firewalls', async () => {
        return HttpResponse.json(
          { error: [{ reason: 'An error occurred.' }] },
          { status: 500 }
        );
      })
    );

    const { findByText, getByText } = renderWithTheme(
      <GenerateFirewallDialog
        onClose={onClose}
        onFirewallGenerated={onFirewallGenerated}
        open
      />
    );

    getByText('Generate an Akamai Compliant Firewall');

    act(() => {
      userEvent.click(getByText('Generate Firewall Now'));
    });

    await findByText('Generating Firewall');

    await findByText('An error occurred');
  });
});
