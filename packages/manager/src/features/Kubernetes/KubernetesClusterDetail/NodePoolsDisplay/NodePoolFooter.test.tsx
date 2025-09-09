import React from 'react';

import { accountFactory, firewallFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NodePoolFooter } from './NodePoolFooter';

import type { EncryptionStatus, KubernetesTier } from '@linode/api-v4';

describe('Node Pool Footer', () => {
  const props = {
    clusterId: 1,
    clusterTier: 'standard' as KubernetesTier,
    encryptionStatus: 'disabled' as EncryptionStatus,
    tags: [],
    poolId: 1,
    poolVersion: undefined,
    poolFirewallId: undefined,
    isLkeClusterRestricted: false,
  };

  it('shows the Pool ID', async () => {
    const { getByText } = renderWithTheme(<NodePoolFooter {...props} />);

    expect(getByText('Pool ID:')).toBeVisible();
    expect(getByText(props.poolId)).toBeVisible();
  });

  it("shows the Node Pool's tags", async () => {
    const tags = ['dev', 'staging', 'production'];

    const { getByText } = renderWithTheme(
      <NodePoolFooter {...props} tags={tags} />
    );

    for (const tag of tags) {
      expect(getByText(tag)).toBeVisible();
    }
  });

  it("shows the node pool's version for a LKE Enterprise cluster", async () => {
    const { getByText } = renderWithTheme(
      <NodePoolFooter
        {...props}
        clusterTier="enterprise"
        poolVersion="v1.31.8+lke5"
      />
    );

    expect(getByText('Version:')).toBeVisible();
    expect(getByText('v1.31.8+lke5')).toBeVisible();
  });

  it("does not show the node pool's version for a standard LKE cluster", async () => {
    const { queryByText } = renderWithTheme(
      <NodePoolFooter
        {...props}
        clusterTier="standard"
        poolVersion="v1.31.8+lke5"
      />
    );

    expect(queryByText('Version:')).not.toBeInTheDocument();
    expect(queryByText('v1.31.8+lke5')).not.toBeInTheDocument();
  });

  it("shows the node pool's firewall for an LKE Enterprise cluster", async () => {
    server.use(
      http.get('*/firewalls/*', () => {
        return HttpResponse.json(
          firewallFactory.build({ id: 123, label: 'my-lke-e-firewall' })
        );
      })
    );
    const { getByText, findByText } = renderWithTheme(
      <NodePoolFooter
        {...props}
        clusterTier="enterprise"
        poolFirewallId={123}
      />
    );

    expect(getByText('Firewall:')).toBeVisible();
    expect(
      await findByText('my-lke-e-firewall', { exact: false })
    ).toBeVisible();
    expect(getByText('123')).toBeVisible();
  });

  it("does not show the node pool's firewall when undefined for a LKE Enterprise cluster ", async () => {
    const { queryByText } = renderWithTheme(
      <NodePoolFooter {...props} clusterTier="enterprise" />
    );

    expect(queryByText('Firewall:')).not.toBeInTheDocument();
  });

  // This check handles the current API behavior for a default firewall (0). TODO: remove this once LKE-7686 is fixed.
  it("does not show the node pool's firewall when 0 for a LKE Enterprise cluster ", async () => {
    const { queryByText } = renderWithTheme(
      <NodePoolFooter {...props} clusterTier="enterprise" poolFirewallId={0} />
    );

    expect(queryByText('Firewall:')).not.toBeInTheDocument();
  });

  it("does not show the node pool's firewall for a standard LKE cluster", async () => {
    server.use(
      http.get('*/firewalls/*', () => {
        return HttpResponse.json(
          firewallFactory.build({ id: 123, label: 'my-lke-e-firewall' })
        );
      })
    );
    const { queryByText } = renderWithTheme(
      <NodePoolFooter {...props} clusterTier="standard" poolFirewallId={123} />
    );

    expect(queryByText('Firewall:')).not.toBeInTheDocument();
    expect(queryByText('my-lke-e-firewall')).not.toBeInTheDocument();
    expect(queryByText('123')).not.toBeInTheDocument();
  });

  it('does not display the encryption status of the pool if the account lacks the capability or the feature flag is off', async () => {
    const { queryByText } = renderWithTheme(<NodePoolFooter {...props} />, {
      flags: { linodeDiskEncryption: false },
    });

    expect(queryByText('Encrypted')).not.toBeInTheDocument();
    expect(queryByText('Not Encrypted')).not.toBeInTheDocument();
  });

  it('shows "Encrypted" with an icon if the Node Pool is encrypted, the feature flag is on, and the account has the capability', async () => {
    const account = accountFactory.build({ capabilities: ['Disk Encryption'] });

    server.use(
      http.get('*/v4*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { findAllByText } = renderWithTheme(
      <NodePoolFooter {...props} encryptionStatus="enabled" />,
      {
        flags: { linodeDiskEncryption: true },
      }
    );

    const [icon, text] = await findAllByText('Encrypted');

    expect(icon).toBeInTheDocument();
    expect(text).toBeVisible();
  });

  it('shows "Not Encrypted" with an icon if the Node Pool is not encrypted, the feature flag is on, and the account has the capability', async () => {
    const account = accountFactory.build({ capabilities: ['Disk Encryption'] });

    server.use(
      http.get('*/v4*/account', () => {
        return HttpResponse.json(account);
      })
    );

    const { findAllByText } = renderWithTheme(
      <NodePoolFooter {...props} encryptionStatus="disabled" />,
      {
        flags: { linodeDiskEncryption: true },
      }
    );

    const [icon, text] = await findAllByText('Not Encrypted');

    expect(icon).toBeInTheDocument();
    expect(text).toBeVisible();
  });
});
