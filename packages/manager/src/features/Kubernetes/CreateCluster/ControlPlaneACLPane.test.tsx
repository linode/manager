import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { ControlPlaneACLPane } from './ControlPlaneACLPane';

import type { ControlPlaneACLProps } from './ControlPlaneACLPane';

const props: ControlPlaneACLProps = {
  enableControlPlaneACL: true,
  errorText: undefined,
  selectedTier: 'standard',
  setControlPlaneACL: vi.fn(),
};

describe('ControlPlaneACLPane', () => {
  it('renders checkbox, fields, and correct copy for a standard cluster when enableControlPlaneACL is true', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <ControlPlaneACLPane {...props} />,
      useFormOptions: {
        defaultValues: {
          control_plane: {
            acl: {
              addresses: {
                ipv4: [''],
                ipv6: [''],
              },
            },
          },
        },
      },
    });

    expect(getByText('Control Plane ACL')).toBeVisible();
    expect(
      getByText(
        'Enable an access control list (ACL) on your LKE cluster to restrict access to your cluster’s control plane. Only the IP addresses and ranges specified in the ACL can connect to the control plane.'
      )
    ).toBeVisible();
    expect(getByText('Enable Control Plane ACL')).toBeVisible();
    expect(getByText('IPv4 Addresses or CIDRs')).toBeVisible();
    expect(getByText('Add IPv4 Address')).toBeVisible();
    expect(getByText('IPv6 Addresses or CIDRs')).toBeVisible();
    expect(getByText('Add IPv6 Address')).toBeVisible();
  });

  it('hides IP fields when enableControlPlaneACL is false for a standard cluster', () => {
    const { getByText, queryByText } = renderWithThemeAndHookFormContext({
      component: (
        <ControlPlaneACLPane {...props} enableControlPlaneACL={false} />
      ),
    });

    expect(getByText('Control Plane ACL')).toBeVisible();
    expect(
      getByText(
        'Enable an access control list (ACL) on your LKE cluster to restrict access to your cluster’s control plane. Only the IP addresses and ranges specified in the ACL can connect to the control plane.'
      )
    ).toBeVisible();
    expect(getByText('Enable Control Plane ACL')).toBeVisible();
    expect(queryByText('IPv4 Addresses or CIDRs')).not.toBeInTheDocument();
    expect(queryByText('Add IPv4 Address')).not.toBeInTheDocument();
    expect(queryByText('IPv6 Addresses or CIDRs')).not.toBeInTheDocument();
    expect(queryByText('Add IPv6 Address')).not.toBeInTheDocument();
  });

  it('renders correct toggle state and copy for an enterprise cluster when enableControlPlaneACL is true', () => {
    const { getByRole, getByText } = renderWithThemeAndHookFormContext({
      component: <ControlPlaneACLPane {...props} selectedTier="enterprise" />,
    });

    expect(getByText('Control Plane ACL')).toBeVisible();
    expect(
      getByText(
        'An access control list (ACL) is enabled by default on LKE Enterprise clusters. All traffic to the control plane is restricted except from IP addresses listed in the ACL. Add at least one IP address or CIDR range.'
      )
    ).toBeVisible();

    // Confirm ACL is checked by default and edits are disabled.
    const toggle = getByRole('checkbox', { name: 'Enable Control Plane ACL' });
    expect(toggle).toBeChecked();
    expect(toggle).toBeDisabled();

    expect(getByText('IPv4 Addresses or CIDRs')).toBeVisible();
    expect(getByText('Add IPv4 Address')).toBeVisible();
    expect(getByText('IPv6 Addresses or CIDRs')).toBeVisible();
    expect(getByText('Add IPv6 Address')).toBeVisible();
  });

  it('calls setControlPlaneACL when clicking the toggle', async () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <ControlPlaneACLPane {...props} />,
    });

    const toggle = getByText('Enable Control Plane ACL');
    await userEvent.click(toggle);

    expect(props.setControlPlaneACL).toHaveBeenCalled();
  });

  it('handles IP changes', async () => {
    const { getByTestId } = renderWithThemeAndHookFormContext({
      component: <ControlPlaneACLPane {...props} />,
      useFormOptions: {
        defaultValues: {
          control_plane: {
            acl: {
              addresses: {
                ipv4: [''],
                ipv6: [''],
              },
            },
          },
        },
      },
    });

    const ipv4 = getByTestId('ipv4-addresses-or-cidrs-ip-address-0');
    await userEvent.type(ipv4, 'test');

    const ipv6 = getByTestId('ipv6-addresses-or-cidrs-ip-address-0');
    await userEvent.type(ipv6, 'test');
  });
});
