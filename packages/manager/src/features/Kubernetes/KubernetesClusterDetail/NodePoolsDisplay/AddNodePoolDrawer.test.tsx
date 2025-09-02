import * as React from 'react';

import { accountFactory } from 'src/factories';
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
      })
    );

    const { findByText, getByLabelText } = renderWithTheme(
      <AddNodePoolDrawer {...props} clusterTier="enterprise" />,
      {
        flags: {
          lkeEnterprise: {
            enabled: true,
            ga: false,
            la: true,
            postLa: true,
            phase2Mtc: false,
          },
        },
      }
    );

    expect(await findByText('Firewall')).toBeVisible();

    const defaultOption = getByLabelText('Use default firewall');
    const existingFirewallOption = getByLabelText('Select existing firewall');

    expect(defaultOption).toBeInTheDocument();
    expect(existingFirewallOption).toBeInTheDocument();

    expect(defaultOption).toBeEnabled();
    expect(existingFirewallOption).toBeEnabled();
  });
});
