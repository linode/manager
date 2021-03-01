import * as Factory from 'factory.ts';
import {
  Firewall,
  FirewallDevice,
  FirewallDeviceEntityType,
  FirewallRules,
  FirewallRuleType,
} from '@linode/api-v4/lib/firewalls/types';

export const firewallRuleFactory = Factory.Sync.makeFactory<FirewallRuleType>({
  ports: '22',
  protocol: 'TCP',
  action: 'DROP',
  addresses: {
    ipv4: ['0.0.0.0/0'],
    ipv6: ['::/0'],
  },
});

export const firewallRulesFactory = Factory.Sync.makeFactory<FirewallRules>({
  inbound: firewallRuleFactory.buildList(1),
  outbound: firewallRuleFactory.buildList(1),
  outbound_policy: 'ACCEPT',
  inbound_policy: 'DROP',
});

export const firewallFactory = Factory.Sync.makeFactory<Firewall>({
  id: Factory.each((id) => id),
  label: Factory.each((id) => `mock-firewall-${id}`),
  rules: firewallRulesFactory.build(),
  created_dt: '2020-01-01 00:00:00',
  updated_dt: '2020-01-01 00:00:00',
  tags: [],
  status: 'enabled',
});

export const firewallDeviceFactory = Factory.Sync.makeFactory<FirewallDevice>({
  id: Factory.each((i) => i),
  created: '2020-01-01',
  updated: '2020-01-01',
  entity: {
    type: 'linode' as FirewallDeviceEntityType,
    label: 'entity',
    id: 10,
    url: '/linodes/1',
  },
});
