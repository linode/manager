import {
  allIPv4,
  allIPv6,
  generateAddressesLabel,
  predefinedFirewallFromRule,
} from './shared';

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
