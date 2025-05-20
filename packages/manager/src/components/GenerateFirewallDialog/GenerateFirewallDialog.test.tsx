import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  firewallFactory,
  firewallRuleFactory,
  firewallTemplateFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { GenerateFirewallDialog } from './GenerateFirewallDialog';

describe('GenerateFirewallButton', () => {
  it('Can successfully generate a firewall', async () => {
    const firewalls = firewallFactory.buildList(2);
    const template = firewallTemplateFactory.build({
      rules: {
        // due to an updated firewallTemplateFactory, we need to specify values for this test
        inbound: [
          firewallRuleFactory.build({
            description: 'firewall-rule-1 description',
            label: 'firewall-rule-1',
          }),
        ],
        outbound: [
          firewallRuleFactory.build({
            description: 'firewall-rule-2 description',
            label: 'firewall-rule-2',
          }),
        ],
      },
    });
    const createFirewallCallback = vi.fn();
    const onClose = vi.fn();
    const onFirewallGenerated = vi.fn();

    server.use(
      http.get('*/v4beta/networking/firewalls', () => {
        return HttpResponse.json(makeResourcePage(firewalls));
      }),
      http.get('*/v4beta/networking/firewalls/templates/*', () => {
        return HttpResponse.json(template);
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

    const clickPromise = userEvent.click(getByText('Generate Firewall Now'));

    await findByText('Generating Firewall');

    await clickPromise;

    await findByText('Complete!');

    expect(onFirewallGenerated).toHaveBeenCalledWith(
      expect.objectContaining({
        label: `${template.slug}-1`,
        rules: { ...template.rules, fingerprint: '8a545843', version: 1 },
      })
    );

    expect(createFirewallCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        label: `${template.slug}-1`,
        rules: { ...template.rules, fingerprint: '8a545843', version: 1 },
      })
    );
  });

  it('Handles errors gracefully', async () => {
    const firewalls = firewallFactory.buildList(2);
    const template = firewallTemplateFactory.build();
    const onClose = vi.fn();
    const onFirewallGenerated = vi.fn();

    server.use(
      http.get('*/v4beta/networking/firewalls', () => {
        return HttpResponse.json(makeResourcePage(firewalls));
      }),
      http.get('*/v4beta/networking/firewalls/templates/*', () => {
        return HttpResponse.json(template);
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

    const clickPromise = userEvent.click(getByText('Generate Firewall Now'));

    await findByText('Generating Firewall');

    await clickPromise;

    await findByText('An error occurred');
  });
});
