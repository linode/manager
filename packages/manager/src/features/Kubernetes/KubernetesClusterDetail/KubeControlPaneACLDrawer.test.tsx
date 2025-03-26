import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { KubeControlPlaneACLDrawer } from './KubeControlPaneACLDrawer';

import type { KubeControlPlaneACLDrawerProps } from './KubeControlPaneACLDrawer';

const props: KubeControlPlaneACLDrawerProps = {
  aclData: undefined,
  closeDrawer: vi.fn(),
  clusterId: 1,
  clusterLabel: 'Test',
  clusterMigrated: true,
  open: true,
};

const queryMocks = vi.hoisted(() => ({
  useKubernetesControlPlaneACLQuery: vi.fn().mockReturnValue({
    data: {
      acl: {
        addresses: {
          ipv4: [''],
          ipv6: [''],
        },
        enabled: false,
        'revision-id': '',
      },
    },
  }),
}));

vi.mock('src/queries/kubernetes', async () => {
  const actual = await vi.importActual<any>('src/queries/kubernetes');
  return {
    ...actual,
    useKubernetesControlPlaneACLQuery:
      queryMocks.useKubernetesControlPlaneACLQuery,
  };
});

describe('KubeControlPaneACLDrawer', () => {
  it('renders the drawer as expected when the cluster is migrated', async () => {
    const { getAllByText, getByText, queryByText } = renderWithTheme(
      <KubeControlPlaneACLDrawer {...props} />
    );

    expect(getByText('Control Plane ACL for Test')).toBeVisible();
    expect(
      getByText(
        "Control Plane ACL secures network access to your LKE cluster's control plane. Use this form to enable or disable the ACL on your LKE cluster, update the list of allowed IP addresses, and adjust other settings."
      )
    ).toBeVisible();

    // Activation Status section
    expect(getByText('Activation Status')).toBeVisible();
    expect(
      getByText(
        'Enable or disable the Control Plane ACL. If the ACL is not enabled, any public IP address can be used to access your control plane. Once enabled, all network access is denied except for the IP addresses and CIDR ranges defined on the ACL.'
      )
    ).toBeVisible();
    expect(getByText('Enable Control Plane ACL')).toBeVisible();

    // Revision ID section
    expect(getAllByText('Revision ID').length).toEqual(2);
    expect(
      getByText(
        'A unique identifying string for this particular revision to the ACL, used by clients to track events related to ACL update requests and enforcement. This defaults to a randomly generated string but can be edited if you prefer to specify your own string to use for tracking this change.'
      )
    ).toBeVisible();

    // Addresses section
    expect(getByText('Addresses')).toBeVisible();
    expect(
      getByText(
        "A list of allowed IPv4 and IPv6 addresses and CIDR ranges. This cluster's control plane will only be accessible from IP addresses within this list."
      )
    ).toBeVisible();
    expect(getByText('IPv4 Addresses or CIDRs')).toBeVisible();
    expect(getByText('Add IPv4 Address')).toBeVisible();
    expect(getByText('IPv6 Addresses or CIDRs')).toBeVisible();
    expect(getByText('Add IPv6 Address')).toBeVisible();

    // Confirm notice does not display
    expect(
      queryByText(
        'Control Plane ACL has not yet been installed on this cluster. During installation, it may take up to 15 minutes for the access control list to be fully enforced.'
      )
    ).not.toBeInTheDocument();
  });

  it('shows a notice and hides revision ID if cluster is not migrated', () => {
    const { getByText, queryByText } = renderWithTheme(
      <KubeControlPlaneACLDrawer {...props} clusterMigrated={false} />
    );

    // Confirm notice displays
    expect(
      getByText(
        'Control Plane ACL has not yet been installed on this cluster. During installation, it may take up to 15 minutes for the access control list to be fully enforced.'
      )
    ).toBeVisible();

    // Confirm Revision ID section doesn't display
    expect(queryByText('Revision ID')).not.toBeInTheDocument();
    expect(
      queryByText(
        'A unique identifying string for this particular revision to the ACL, used by clients to track events related to ACL update requests and enforcement. This defaults to a randomly generated string but can be edited if you prefer to specify your own string to use for tracking this change.'
      )
    ).not.toBeInTheDocument();

    // Confirm other sections still exist
    expect(getByText('Activation Status')).toBeVisible();
    expect(getByText('Enable Control Plane ACL')).toBeVisible();
    expect(getByText('Addresses')).toBeVisible();
    expect(getByText('IPv4 Addresses or CIDRs')).toBeVisible();
    expect(getByText('Add IPv4 Address')).toBeVisible();
    expect(getByText('IPv6 Addresses or CIDRs')).toBeVisible();
    expect(getByText('Add IPv6 Address')).toBeVisible();
  });

  it('closes the drawer', async () => {
    const { getByText } = renderWithTheme(
      <KubeControlPlaneACLDrawer {...props} />
    );

    const cancel = getByText('Cancel');
    await userEvent.click(cancel);

    expect(props.closeDrawer).toHaveBeenCalled();
  });
});
