import * as Factory from 'factory.ts';
import {
  Firewall,
  FirewallDevice,
  FirewallDeviceEntityType,
  FirewallRules,
  FirewallRuleType
} from 'linode-js-sdk/lib/firewalls/types';

export const firewallRuleFactory = Factory.Sync.makeFactory<FirewallRuleType>({
  ports: '22',
  protocol: 'TCP',
  addresses: {}
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

export const firewallDeviceFactory = Factory.Sync.makeFactory<FirewallDevice>({
  id: Factory.each(i => i),
  created: '2020-01-01',
  updated: '2020-01-01',
  entity: {
    type: 'linode' as FirewallDeviceEntityType,
    label: Factory.each(i => `factory-device-${i}`) as any,
    id: Factory.each(i => i) as any,
    url: '/linodes/1'
  }
});
