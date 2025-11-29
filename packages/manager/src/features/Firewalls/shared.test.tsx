/* eslint-disable react/jsx-no-useless-fragment */
import { renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme, wrapWithTheme } from 'src/utilities/testHelpers';

import {
  allIPv4,
  allIPv6,
  buildPrefixListReferenceMap,
  generateAddressesLabel,
  generateAddressesLabelV2,
  predefinedFirewallFromRule,
  useIsFirewallRulesetsPrefixlistsEnabled,
} from './shared';

import type { PrefixListReferenceMap } from './shared';
import type { FirewallRuleType } from '@linode/api-v4/lib/firewalls/types';

const addresses = {
  ipv4: [allIPv4],
  ipv6: [allIPv6],
};

const limitedAddresses = {
  ipv4: ['1.1.1.1'],
  ipv6: ['::'],
};

describe('predefinedFirewallFromRule', () => {
  const rule: FirewallRuleType = {
    action: 'ACCEPT',
    addresses,
    ports: '',
    protocol: 'TCP',
  };

  it('handles SSH', () => {
    rule.ports = '22';
    expect(predefinedFirewallFromRule(rule)).toBe('ssh');
  });
  it('handles HTTP', () => {
    rule.ports = '80';
    expect(predefinedFirewallFromRule(rule)).toBe('http');
  });
  it('handles HTTPS', () => {
    rule.ports = '443';
    expect(predefinedFirewallFromRule(rule)).toBe('https');
  });
  it('handles MySQL', () => {
    rule.ports = '3306';
    expect(predefinedFirewallFromRule(rule)).toBe('mysql');
  });
  it('handles DNS', () => {
    rule.ports = '53';
    expect(predefinedFirewallFromRule(rule)).toBe('dns');
  });

  it('returns `undefined` when given an unrecognizable rule', () => {
    expect(
      predefinedFirewallFromRule({
        action: 'ACCEPT',
        addresses,
        // Test another port
        ports: '22-24',
        protocol: 'TCP',
      })
    ).toBeUndefined();

    expect(
      predefinedFirewallFromRule({
        action: 'ACCEPT',
        addresses,
        ports: '22',
        // Test another protocol
        protocol: 'UDP',
      })
    ).toBeUndefined();

    expect(
      predefinedFirewallFromRule({
        action: 'ACCEPT',
        // Test other addresses
        addresses: limitedAddresses,
        ports: '22',
        protocol: 'TCP',
      })
    ).toBeUndefined();
  });
});

describe('generateAddressLabel', () => {
  it('includes the All IPv4 label if appropriate', () => {
    expect(generateAddressesLabel(addresses).includes('All IPv4')).toBe(true);
    expect(generateAddressesLabel(limitedAddresses).includes('All IPv4')).toBe(
      false
    );
  });

  it("doesn't include other IPv4 addresses if ALL are also specified", () => {
    const result = generateAddressesLabel({
      ...addresses,
      ipv4: [allIPv4, '1.1.1.1'],
    });
    expect(result.includes('All IPv4')).toBe(true);
    expect(result.includes('1.1.1.1')).toBe(false);
  });

  it('includes the All IPv6 label if appropriate', () => {
    expect(generateAddressesLabel(addresses).includes('All IPv6')).toBe(true);
  });

  it("doesn't include other IPv6 addresses if ALL are also specified", () => {
    const result = generateAddressesLabel({
      ...addresses,
      ipv6: [allIPv6, '::1'],
    });
    expect(result.includes('All IPv6')).toBe(true);
    expect(result.includes('::1')).toBe(false);
  });

  it('includes all appropriate addresses', () => {
    expect(generateAddressesLabel(addresses)).toBe('All IPv4, All IPv6');
    expect(generateAddressesLabel({ ipv4: ['1.1.1.1'] })).toBe('1.1.1.1');
    expect(generateAddressesLabel({ ipv6: ['::1'] })).toBe('::1');
    expect(
      generateAddressesLabel({ ipv4: ['1.1.1.1, 2.2.2.2'], ipv6: ['::1'] })
    ).toBe('1.1.1.1, 2.2.2.2, ::1');
    expect(
      generateAddressesLabel({ ipv4: ['1.1.1.1, 2.2.2.2'], ipv6: [allIPv6] })
    ).toBe('All IPv6, 1.1.1.1, 2.2.2.2');
  });

  it('truncates large lists', () => {
    expect(
      generateAddressesLabel({
        ipv4: ['1.1.1.1', '2.2.2.2', '3.3.3.3', '4.4.4.4', '5.5.5.5'],
      })
    ).toBe('1.1.1.1, 2.2.2.2, 3.3.3.3, plus 2 more');
  });

  it('should always display "All IPv4" and "All IPv6", even if the label is truncated', () => {
    expect(
      generateAddressesLabel({
        ipv4: ['1.1.1.1', '2.2.2.2', '3.3.3.3', '4.4.4.4', '5.5.5.5'],
        ipv6: ['::/0'],
      })
    ).toBe('All IPv6, 1.1.1.1, 2.2.2.2, plus 3 more');
  });

  it('returns "None" if necessary', () => {
    expect(generateAddressesLabel({ ipv4: undefined, ipv6: undefined })).toBe(
      'None'
    );
  });
});

describe('buildPrefixListMap', () => {
  it('returns empty map if no input', () => {
    const result = buildPrefixListReferenceMap({});
    expect(result).toEqual({});
  });

  it('maps IPv4 prefix lists correctly', () => {
    const ipv4 = ['pl:example1', '192.168.0.1', 'pl:example2'];
    const result: PrefixListReferenceMap = buildPrefixListReferenceMap({
      ipv4,
    });

    expect(result).toEqual({
      'pl:example1': { inIPv4Rule: true, inIPv6Rule: false },
      'pl:example2': { inIPv4Rule: true, inIPv6Rule: false },
    });
  });

  it('maps IPv6 prefix lists correctly', () => {
    const ipv6 = ['pl:example1', 'fe80::1', 'pl:example2'];
    const result: PrefixListReferenceMap = buildPrefixListReferenceMap({
      ipv6,
    });

    expect(result).toEqual({
      'pl:example1': { inIPv4Rule: false, inIPv6Rule: true },
      'pl:example2': { inIPv4Rule: false, inIPv6Rule: true },
    });
  });

  it('maps both IPv4 and IPv6 for the same prefix list', () => {
    const ipv4 = ['pl:example1'];
    const ipv6 = ['pl:example1'];
    const result: PrefixListReferenceMap = buildPrefixListReferenceMap({
      ipv4,
      ipv6,
    });

    expect(result).toEqual({
      'pl:example1': { inIPv4Rule: true, inIPv6Rule: true },
    });
  });

  it('ignores non-prefix list IPs', () => {
    const ipv4 = ['192.168.0.1'];
    const ipv6 = ['fe80::1'];
    const result: PrefixListReferenceMap = buildPrefixListReferenceMap({
      ipv4,
      ipv6,
    });

    expect(result).toEqual({});
  });

  it('handles duplicates correctly', () => {
    const ipv4 = ['pl:duplicate-example', 'pl:duplicate-example'];
    const ipv6 = ['pl:duplicate-example'];
    const result: PrefixListReferenceMap = buildPrefixListReferenceMap({
      ipv4,
      ipv6,
    });

    expect(result).toEqual({
      'pl:duplicate-example': { inIPv4Rule: true, inIPv6Rule: true },
    });
  });
});

describe('generateAddressesLabelV2', () => {
  const onPrefixListClick = vi.fn();

  const addresses: FirewallRuleType['addresses'] = {
    ipv4: [
      'pl:system:test-1', // PL attached to both IPv4/IPv6
      'pl::test-2', // PL attached to IPv4 only
      '192.168.1.1', // individual IP
    ],
    ipv6: [
      'pl:system:test-1', // same system PL
      'pl::test-3', // PL attached to IPv6 only
      '2001:db8:85a3::8a2e:370:7334/128', // individual IP
    ],
  };

  it('renders PLs with correct Firewall IP reference labels', () => {
    const result = generateAddressesLabelV2({
      addresses,
      onPrefixListClick,
      showTruncateChip: false,
    });
    const { getByText } = renderWithTheme(<>{result}</>);

    // Check PLs with proper suffixes
    expect(getByText('pl:system:test-1 (IPv4, IPv6)')).toBeVisible();
    expect(getByText('pl::test-2 (IPv4)')).toBeVisible();
    expect(getByText('pl::test-3 (IPv6)')).toBeVisible();
  });

  it('renders individual IP addresses correctly', () => {
    const result = generateAddressesLabelV2({
      addresses,
      showTruncateChip: false,
    });
    const { getByText } = renderWithTheme(<>{result}</>);

    expect(getByText('192.168.1.1')).toBeVisible();
    expect(getByText('2001:db8:85a3::8a2e:370:7334/128')).toBeVisible();
  });

  it('triggers onPrefixListClick when PL is clicked', async () => {
    const result = generateAddressesLabelV2({
      addresses,
      onPrefixListClick,
      showTruncateChip: false,
    });
    const { getByText } = renderWithTheme(<>{result}</>);

    await userEvent.click(getByText(/pl:system:test-1/));
    expect(onPrefixListClick).toHaveBeenCalledWith(
      'pl:system:test-1',
      '(IPv4, IPv6)'
    );

    await userEvent.click(getByText(/pl::test-2/));
    expect(onPrefixListClick).toHaveBeenCalledWith('pl::test-2', '(IPv4)');

    await userEvent.click(getByText(/pl::test-3/));
    expect(onPrefixListClick).toHaveBeenCalledWith('pl::test-3', '(IPv6)');
  });

  it('renders None if no addresses are provided', () => {
    const result = generateAddressesLabelV2({
      addresses: { ipv4: [], ipv6: [] },
    });
    const { getByText } = renderWithTheme(<>{result}</>);
    expect(getByText('None')).toBeVisible();
  });

  it('renders "All IPv4, All IPv6" when allowAll type is present in addresses', () => {
    const addressesAll = { ipv4: ['0.0.0.0/0'], ipv6: ['::/0'] };
    const result = generateAddressesLabelV2({ addresses: addressesAll });
    const { getByText } = renderWithTheme(<>{result}</>);
    expect(getByText('All IPv4, All IPv6')).toBeVisible();
  });

  it('handles truncation and shows Chip for hidden items', () => {
    const result = generateAddressesLabelV2({
      addresses,
      showTruncateChip: true,
      truncateAt: 2,
    });
    const { container } = renderWithTheme(<>{result}</>);
    expect(container.textContent).toContain('+3'); // 5 total items (2 visible and 3 hidden)
  });

  it('renders only 1 visible item and shows a Chip for the remaining when showTruncateChip is true and truncateAt is 1', () => {
    const result = generateAddressesLabelV2({
      addresses,
      showTruncateChip: true,
      truncateAt: 1,
    });
    const { getByText, queryByText } = renderWithTheme(<>{result}</>);

    expect(getByText('pl:system:test-1 (IPv4, IPv6)')).toBeVisible();

    expect(getByText('+4')).toBeVisible(); // 5 total elements (1 shown + 4 hidden)

    // Hidden items are not rendered outside tooltip
    expect(queryByText('pl::test-2 (IPv4)')).toBeNull();
    expect(queryByText('pl::test-3 (IPv6)')).toBeNull();
    expect(queryByText('192.168.1.1')).toBeNull();
    expect(queryByText('2001:db8:85a3::8a2e:370:7334/128')).toBeNull();
  });

  it('renders all items if showTruncateChip is false', () => {
    const result = generateAddressesLabelV2({
      addresses,
      showTruncateChip: false,
      truncateAt: 1, // should be ignored
    });
    const { getByText } = renderWithTheme(<>{result}</>);

    expect(getByText('pl:system:test-1 (IPv4, IPv6)')).toBeVisible();
    expect(getByText('pl::test-2 (IPv4)')).toBeVisible();
    expect(getByText('pl::test-3 (IPv6)')).toBeVisible();
    expect(getByText('192.168.1.1')).toBeVisible();
    expect(getByText('2001:db8:85a3::8a2e:370:7334/128')).toBeVisible();
  });

  it('tooltip shows only hidden elements when showTruncateChip is true', async () => {
    const result = generateAddressesLabelV2({
      addresses,
      showTruncateChip: true,
      truncateAt: 2,
    });

    const { findByText, getByText, queryByText } = renderWithTheme(
      <>{result}</>
    );

    // Only the first 2 elements are visible outside tooltip
    expect(getByText('pl:system:test-1 (IPv4, IPv6)')).toBeVisible();
    expect(getByText('pl::test-2 (IPv4)')).toBeVisible();
    expect(queryByText('pl::test-3 (IPv6)')).toBeNull();
    expect(queryByText('192.168.1.1')).toBeNull();
    expect(queryByText('2001:db8:85a3::8a2e:370:7334/128')).toBeNull();

    // Chip shows correct hidden count
    const chip = getByText('+3');
    expect(chip).toBeVisible();

    // Hover on chip
    await userEvent.hover(chip);

    // Only hidden items should be visible in tooltip
    expect(await findByText('pl::test-3 (IPv6)')).toBeVisible();
    expect(await findByText('192.168.1.1')).toBeVisible();
    expect(await findByText('2001:db8:85a3::8a2e:370:7334/128')).toBeVisible();
  });
});

describe('useIsFirewallRulesetsPrefixlistsEnabled', () => {
  it('returns true if the feature is enabled', async () => {
    const options = {
      flags: {
        fwRulesetsPrefixLists: {
          enabled: true,
          beta: false,
          la: false,
          ga: false,
        },
      },
    };

    const { result } = renderHook(
      () => useIsFirewallRulesetsPrefixlistsEnabled(),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    await waitFor(() => {
      expect(result.current.isFirewallRulesetsPrefixlistsFeatureEnabled).toBe(
        true
      );
    });
  });

  it('returns false if the feature is NOT enabled', async () => {
    const options = {
      flags: {
        fwRulesetsPrefixLists: {
          enabled: false,
          beta: false,
          la: false,
          ga: false,
        },
      },
    };

    const { result } = renderHook(
      () => useIsFirewallRulesetsPrefixlistsEnabled(),
      {
        wrapper: (ui) => wrapWithTheme(ui, options),
      }
    );

    await waitFor(() => {
      expect(result.current.isFirewallRulesetsPrefixlistsFeatureEnabled).toBe(
        false
      );
    });
  });
});
