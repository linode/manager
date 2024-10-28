import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ControlPlaneACLPane } from './ControlPlaneACLPane';

import type { ControlPlaneACLProps } from './ControlPlaneACLPane';

const props: ControlPlaneACLProps = {
  enableControlPlaneACL: true,
  errorText: undefined,
  handleIPv4Change: vi.fn(),
  handleIPv6Change: vi.fn(),
  ipV4Addr: [{ address: '' }],
  ipV6Addr: [{ address: '' }],
  setControlPlaneACL: vi.fn(),
};

describe('ControlPlaneACLPane', () => {
  it('renders all fields when enableControlPlaneACL is true', () => {
    const { getByText } = renderWithTheme(<ControlPlaneACLPane {...props} />);

    expect(getByText('Control Plane ACL')).toBeVisible();
    expect(
      getByText(
        'Enable an access control list (ACL) on your LKE cluster to restrict access to your cluster’s control plane. When enabled, only the IP addresses and ranges you specify can connect to the control plane.'
      )
    ).toBeVisible();
    expect(getByText('Enable Control Plane ACL')).toBeVisible();
    expect(getByText('IPv4 Addresses or CIDRs')).toBeVisible();
    expect(getByText('Add IPv4 Address')).toBeVisible();
    expect(getByText('IPv6 Addresses or CIDRs')).toBeVisible();
    expect(getByText('Add IPv6 Address')).toBeVisible();
  });

  it('hides IP fields when enableControlPlaneACL is false', () => {
    const { getByText, queryByText } = renderWithTheme(
      <ControlPlaneACLPane {...props} enableControlPlaneACL={false} />
    );

    expect(getByText('Control Plane ACL')).toBeVisible();
    expect(
      getByText(
        'Enable an access control list (ACL) on your LKE cluster to restrict access to your cluster’s control plane. When enabled, only the IP addresses and ranges you specify can connect to the control plane.'
      )
    ).toBeVisible();
    expect(getByText('Enable Control Plane ACL')).toBeVisible();
    expect(queryByText('IPv4 Addresses or CIDRs')).not.toBeInTheDocument();
    expect(queryByText('Add IPv4 Address')).not.toBeInTheDocument();
    expect(queryByText('IPv6 Addresses or CIDRs')).not.toBeInTheDocument();
    expect(queryByText('Add IPv6 Address')).not.toBeInTheDocument();
  });

  it('calls setControlPlaneACL when clicking the toggle', async () => {
    const { getByText } = renderWithTheme(<ControlPlaneACLPane {...props} />);

    const toggle = getByText('Enable Control Plane ACL');
    await userEvent.click(toggle);

    expect(props.setControlPlaneACL).toHaveBeenCalled();
  });

  it('handles IP changes', async () => {
    const { getByLabelText } = renderWithTheme(
      <ControlPlaneACLPane {...props} />
    );

    const ipv4 = getByLabelText('IPv4 Addresses or CIDRs ip-address-0');
    await userEvent.type(ipv4, 'test');

    expect(props.handleIPv4Change).toHaveBeenCalled();

    const ipv6 = getByLabelText('IPv6 Addresses or CIDRs ip-address-0');
    await userEvent.type(ipv6, 'test');

    expect(props.handleIPv6Change).toHaveBeenCalled();
  });
});
