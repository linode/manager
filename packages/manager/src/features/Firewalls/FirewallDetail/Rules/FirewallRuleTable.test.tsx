import { ExtendedFirewallRule } from './firewallRuleEditor';
import { firewallRuleToRowData, sortPortString } from './FirewallRuleTable';

describe('Firewall rule table tests', () => {
  describe('firewallRuleToRowData', () => {
    it('transforms a FirewallRuleType to the appropriate row', () => {
      const rule: ExtendedFirewallRule = {
        ports: '22',
        protocol: 'TCP',
        addresses: { ipv4: ['0.0.0.0/0'], ipv6: ['::/0'] },
        status: 'NOT_MODIFIED'
      };
      expect(firewallRuleToRowData([rule])[0]).toHaveProperty('type', 'SSH');
      expect(firewallRuleToRowData([rule])[0]).toHaveProperty(
        'protocol',
        'TCP'
      );
      expect(firewallRuleToRowData([rule])[0]).toHaveProperty('ports', '22');
      expect(firewallRuleToRowData([rule])[0]).toHaveProperty(
        'addresses',
        'All IPv4, All IPv6'
      );
    });
  });

  describe('sortPortString utility', () => {
    it('should sort ports numerically', () => {
      expect(sortPortString('80, 22')).toMatch('22, 80');
      expect(sortPortString('443, 22, 80-81')).toMatch('22, 80-81, 443');
    });

    it('should handle whitespace variations', () => {
      expect(sortPortString('443,22,80-81')).toMatch('22, 80-81, 443');
    });

    it('should return the string unaltered with bad input', () => {
      expect(sortPortString('')).toBe('');
      expect(sortPortString('33, XX-gibberish')).toMatch('33, XX-gibberish');
    });
  });
});
