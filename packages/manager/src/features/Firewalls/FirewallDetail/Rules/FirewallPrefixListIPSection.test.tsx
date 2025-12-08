import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { PrefixListIPSection } from './FirewallPrefixListIPSection';

describe('PrefixListIPSection', () => {
  const baseProps = {
    type: 'IPv4' as const,
    addresses: ['192.0.2.1/32', '192.0.3.1/32'],
    inUse: true,
    hideUsageIndicator: false,
  };

  it('renders addresses correctly', () => {
    const { getByText } = renderWithTheme(
      <PrefixListIPSection {...baseProps} />
    );
    expect(getByText('192.0.2.1/32, 192.0.3.1/32')).toBeVisible();
  });

  it('shows "in use" chip when inUse is true and hideUsageIndicator is false', () => {
    const { getByTestId } = renderWithTheme(
      <PrefixListIPSection {...baseProps} />
    );
    const chip = getByTestId('ipv4-chip');
    expect(chip).toBeVisible();
    expect(chip).toHaveTextContent('in use');
  });

  it('shows "not in use" chip when inUse is false and hideUsageIndicator is false', () => {
    const { getByTestId } = renderWithTheme(
      <PrefixListIPSection {...baseProps} inUse={false} />
    );
    const chip = getByTestId('ipv4-chip');
    expect(chip).toBeVisible();
    expect(chip).toHaveTextContent('not in use');
  });

  it('does not show chip when hideUsageIndicator is true', () => {
    const { queryByTestId } = renderWithTheme(
      <PrefixListIPSection {...baseProps} hideUsageIndicator />
    );
    expect(queryByTestId('ipv4-chip')).not.toBeInTheDocument();
  });

  it('renders fallback text when addresses array is empty', () => {
    const { getByText } = renderWithTheme(
      <PrefixListIPSection {...baseProps} addresses={[]} />
    );
    expect(getByText('no IP addresses')).toBeVisible();
  });

  it('renders IPv6 type correctly', () => {
    const { getByText, getByTestId } = renderWithTheme(
      <PrefixListIPSection {...baseProps} addresses={['::1/128']} type="IPv6" />
    );
    expect(getByTestId('ipv6-section')).toBeVisible();
    expect(getByText('::1/128')).toBeVisible();
  });
});
