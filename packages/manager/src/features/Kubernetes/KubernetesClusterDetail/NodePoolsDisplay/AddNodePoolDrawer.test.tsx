import { linodeTypeFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { accountFactory, firewallFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddNodePoolDrawer } from './AddNodePoolDrawer';

import type { Props } from './AddNodePoolDrawer';

const props: Props = {
  clusterId: 0,
  clusterLabel: 'test',
  clusterRegionId: 'us-east',
  clusterTier: 'standard',
  onClose: vi.fn(),
  open: true,
};

describe('AddNodePoolDrawer', () => {
  describe('Plans', () => {
    it('should render plan heading', async () => {
      const { findByText } = renderWithTheme(<AddNodePoolDrawer {...props} />);

      await findByText('Dedicated CPU');
    });

    it('should display the GPU tab for standard clusters', async () => {
      const { findByText } = renderWithTheme(<AddNodePoolDrawer {...props} />);

      expect(await findByText('GPU')).toBeInTheDocument();
    });

    it('should not display the GPU tab for enterprise clusters', async () => {
      const { queryByText } = renderWithTheme(
        <AddNodePoolDrawer {...props} clusterTier="enterprise" />
      );

      expect(queryByText('GPU')).toBeNull();
    });
  });

  describe('Firewall', () => {
    // LKE-E Post LA must be enabled for the Firewall option to show up
    const flags = {
      lkeEnterprise2: {
        enabled: true,
        ga: false,
        la: true,
        postLa: true,
        phase2Mtc: { byoVPC: false, dualStack: false },
      },
    };

    it('should not display "Firewall" as an option by default', async () => {
      const { queryByText } = renderWithTheme(
        <AddNodePoolDrawer {...props} clusterTier="standard" />
      );

      expect(queryByText('Firewall')).toBeNull();
    });

    it('should display "Firewall" as an option for enterprise clusters if the postLA flag is on and the account has the capability', async () => {
      const account = accountFactory.build({
        capabilities: ['Kubernetes Enterprise'],
      });

      server.use(
        http.get('*/v4*/account', () => {
          return HttpResponse.json(account);
        }),
        http.get('*/v4*/linode/types', () => {
          return HttpResponse.json(makeResourcePage([]));
        })
      );

      const { findByText, getByLabelText } = renderWithTheme(
        <AddNodePoolDrawer {...props} clusterTier="enterprise" />,
        { flags }
      );

      expect(await findByText('Firewall')).toBeVisible();

      const defaultOption = getByLabelText('Use default firewall');
      const existingFirewallOption = getByLabelText('Select existing firewall');

      expect(defaultOption).toBeInTheDocument();
      expect(existingFirewallOption).toBeInTheDocument();

      expect(defaultOption).toBeEnabled();
      expect(existingFirewallOption).toBeEnabled();
    });

    it('should allow the user to pick an existing firewall for enterprise clusters if the postLA flag is on and the account has the capability', async () => {
      const account = accountFactory.build({
        capabilities: ['Kubernetes Enterprise'],
      });
      const firewall = firewallFactory.build({ id: 12 });
      const type = linodeTypeFactory.build({
        label: 'Linode 4GB',
        class: 'dedicated',
      });

      const onCreatePool = vi.fn();

      server.use(
        http.get('*/v4*/account', () => {
          return HttpResponse.json(account);
        }),
        http.get('*/v4*/linode/types', () => {
          return HttpResponse.json(makeResourcePage([type]));
        }),
        http.get('*/v4*/networking/firewalls', () => {
          return HttpResponse.json(makeResourcePage([firewall]));
        }),
        http.post(
          '*/v4*/lke/clusters/:clusterId/pools',
          async ({ request }) => {
            const data = await request.json();
            onCreatePool(data);
            return HttpResponse.json(data);
          }
        )
      );

      const { findByText, findByLabelText, getByRole, getByPlaceholderText } =
        renderWithTheme(
          <AddNodePoolDrawer {...props} clusterTier="enterprise" />,
          { flags }
        );

      expect(await findByText('Linode 4 GB')).toBeVisible();

      await userEvent.click(getByRole('button', { name: 'Add 1' }));
      await userEvent.click(getByRole('button', { name: 'Add 1' }));
      await userEvent.click(getByRole('button', { name: 'Add 1' }));

      const existingFirewallOption = await findByLabelText(
        'Select existing firewall'
      );

      await userEvent.click(existingFirewallOption);

      const firewallSelect = getByPlaceholderText('Select firewall');

      await userEvent.click(firewallSelect);

      await userEvent.click(await findByText(firewall.label));

      await userEvent.click(getByRole('button', { name: 'Add pool' }));

      await waitFor(() => {
        expect(onCreatePool).toHaveBeenCalledWith({
          firewall_id: 12,
          count: 3,
          type: type.id,
          update_strategy: 'on_recycle',
        });
      });
    });
  });
});
