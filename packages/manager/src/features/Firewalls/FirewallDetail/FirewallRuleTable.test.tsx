import { FirewallRuleType } from 'linode-js-sdk/lib/firewalls/types';
import { firewallRuleToRowData } from './FirewallRuleTable';

describe('firewallRuleToRowData', () => {
  it('transforms a FirewallRuleType to the appropriate row', () => {
    const rule: FirewallRuleType = {
      ports: '22',
      protocol: 'TCP',
      addresses: { ipv4: ['0.0.0.0/0'], ipv6: ['::0/0'] }
    };
    expect(firewallRuleToRowData([rule])[0]).toHaveProperty('type', 'SSH');
    expect(firewallRuleToRowData([rule])[0]).toHaveProperty('protocol', 'TCP');
    expect(firewallRuleToRowData([rule])[0]).toHaveProperty('ports', '22');
    expect(firewallRuleToRowData([rule])[0]).toHaveProperty(
      'addresses',
      'All IPv4, All IPv6'
    );
  });
});
