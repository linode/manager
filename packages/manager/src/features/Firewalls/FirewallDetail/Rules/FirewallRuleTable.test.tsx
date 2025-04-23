import { firewallRuleToRowData } from './FirewallRuleTable';

import type { ExtendedFirewallRule } from './firewallRuleEditor';

describe('Firewall rule table tests', () => {
  describe('firewallRuleToRowData', () => {
    it('transforms a FirewallRuleType to the appropriate row', () => {
      const rule: ExtendedFirewallRule = {
        action: 'ACCEPT',
        addresses: { ipv4: ['0.0.0.0/0'], ipv6: ['::/0'] },
        originalIndex: 0,
        ports: '22',
        protocol: 'TCP',
        status: 'NOT_MODIFIED',
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
});
