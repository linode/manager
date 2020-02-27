import * as Factory from 'factory.ts';
import {
  Firewall,
  FirewallRules,
  FirewallRuleType
} from 'linode-js-sdk/lib/firewalls/types';

export const firewallRuleFactory = Factory.Sync.makeFactory<FirewallRuleType>({
  ports: '22',
  protocol: 'TCP',
  addresses: {
    ipv4: ['0.0.0.0/0'],
    ipv6: ['::0/0']
  }
});

export const firewallRulesFactory = Factory.Sync.makeFactory<FirewallRules>({
  inbound: firewallRuleFactory.buildList(1),
  outbound: firewallRuleFactory.buildList(1)
});

export const firewallFactory = Factory.Sync.makeFactory<Firewall>({
  id: Factory.each(id => id),
  label: Factory.each(id => `mock-firewall-${id}`),
  rules: firewallRulesFactory.build(),
  created_dt: '2020-01-01 00:00:00',
  updated_dt: '2020-01-01 00:00:00',
  tags: [],
  status: 'enabled'
});
