import {
  Firewall,
  FirewallDevice,
  FirewallDeviceEntityType,
  FirewallRuleType,
  FirewallRules,
} from '@linode/api-v4/lib/firewalls/types';
import * as Factory from 'factory.ts';

export const firewallRuleFactory = Factory.Sync.makeFactory<FirewallRuleType>({
  action: 'DROP',
  addresses: {
    ipv4: ['0.0.0.0/0'],
    ipv6: ['::/0'],
  },
  description: Factory.each((i) => `firewall-rule-${i} description`),
  label: Factory.each((i) => `firewall-rule-${i}`),
  ports: '22',
  protocol: 'TCP',
});

export const firewallRulesFactory = Factory.Sync.makeFactory<FirewallRules>({
  inbound: firewallRuleFactory.buildList(1),
  inbound_policy: 'DROP',
  outbound: firewallRuleFactory.buildList(1),
  outbound_policy: 'ACCEPT',
});

export const firewallFactory = Factory.Sync.makeFactory<Firewall>({
  created_dt: '2020-01-01 00:00:00',
  entities: [
    {
      id: 1,
      label: 'my-linode',
      type: 'linode' as FirewallDeviceEntityType,
      url: '/test',
    },
  ],
  id: Factory.each((id) => id),
  label: Factory.each((id) => `mock-firewall-${id}`),
  rules: firewallRulesFactory.build(),
  status: 'enabled',
  tags: [],
  updated_dt: '2020-01-01 00:00:00',
});

export const firewallDeviceFactory = Factory.Sync.makeFactory<FirewallDevice>({
  created: '2020-01-01',
  entity: {
    id: 10,
    label: 'entity',
    type: 'linode' as FirewallDeviceEntityType,
    url: '/linodes/1',
  },
  id: Factory.each((i) => i),
  updated: '2020-01-01',
});
