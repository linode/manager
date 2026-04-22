import { nodeBalancerFactory } from '@linode/utilities';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { FrontendConfiguration } from './FrontendConfiguration';

describe('FrontendConfiguration', () => {
  it('renders the public frontend type and both frontend IP addresses', () => {
    const nodebalancer = nodeBalancerFactory.build({
      frontend_address_type: 'public',
      ipv4: '192.0.2.10',
      ipv6: '2001:db8::10',
    });

    const { getByText, getByTestId } = renderWithTheme(
      <FrontendConfiguration nodebalancer={nodebalancer} />
    );

    expect(getByText('Frontend Configuration')).toBeVisible();
    expect(getByText('Type:')).toBeVisible();
    expect(getByText('Public')).toBeVisible();
    expect(getByTestId('ipv4-label')).toHaveTextContent('IPv4 Address');
    expect(getByTestId('ipv6-label')).toHaveTextContent('IPv6 Address');
    expect(getByText('192.0.2.10')).toBeVisible();
    expect(getByText('2001:db8::10')).toBeVisible();
  });

  it('renders the VPC frontend type and hides the IPv6 section when no IPv6 address exists', () => {
    const nodebalancer = nodeBalancerFactory.build({
      frontend_address_type: 'vpc',
      ipv4: '192.0.2.20',
      ipv6: null,
    });

    const { getByText, queryByTestId } = renderWithTheme(
      <FrontendConfiguration nodebalancer={nodebalancer} />
    );

    expect(getByText('VPC')).toBeVisible();
    expect(getByText('192.0.2.20')).toBeVisible();
    expect(queryByTestId('ipv6-label')).not.toBeInTheDocument();
  });
});
