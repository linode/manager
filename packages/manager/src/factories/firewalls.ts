import {
  type Firewall,
  type FirewallDevice,
  type FirewallDeviceEntityType,
  type FirewallRules,
  type FirewallRuleType,
  type FirewallSettings,
  type FirewallTemplate,
  type FirewallTemplateRules,
} from '@linode/api-v4/lib/firewalls/types';
import { Factory } from '@linode/utilities';

import type {
  FirewallDeviceEntity,
  FirewallPrefixList,
  FirewallRuleSet,
} from '@linode/api-v4/lib/firewalls/types';

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
  fingerprint: '8a545843',
  inbound: firewallRuleFactory.buildList(1),
  inbound_policy: 'DROP',
  outbound: firewallRuleFactory.buildList(1),
  outbound_policy: 'ACCEPT',
  version: 1,
});

export const firewallTemplateRulesFactory =
  Factory.Sync.makeFactory<FirewallTemplateRules>({
    inbound: firewallRuleFactory.buildList(1),
    inbound_policy: 'DROP',
    outbound: firewallRuleFactory.buildList(1),
    outbound_policy: 'ACCEPT',
  });

export const firewallFactory = Factory.Sync.makeFactory<Firewall>({
  created: '2020-01-01T00:00:00',
  entities: [
    {
      id: 1,
      label: 'my-linode',
      type: 'linode' as FirewallDeviceEntityType,
      url: '/test',
      parent_entity: null,
    },
  ],
  id: Factory.each((id) => id),
  label: Factory.each((id) => `mock-firewall-${id}`),
  rules: firewallRulesFactory.build(),
  status: 'enabled',
  tags: [],
  updated: '2020-01-01T00:00:00',
});

export const firewallEntityfactory =
  Factory.Sync.makeFactory<FirewallDeviceEntity>({
    id: 1,
    label: 'my-linode',
    type: 'linode' as FirewallDeviceEntityType,
    url: '/test',
    parent_entity: null,
  });

export const firewallDeviceFactory = Factory.Sync.makeFactory<FirewallDevice>({
  created: '2020-01-01',
  entity: {
    id: 10,
    label: 'entity',
    type: 'linode' as FirewallDeviceEntityType,
    url: '/linodes/1',
    parent_entity: null,
  },
  id: Factory.each((i) => i),
  updated: '2020-01-01',
});

export const firewallTemplateFactory =
  Factory.Sync.makeFactory<FirewallTemplate>({
    rules: firewallTemplateRulesFactory.build(),
    slug: 'akamai-non-prod',
  });

export const firewallSettingsFactory =
  Factory.Sync.makeFactory<FirewallSettings>({
    default_firewall_ids: {
      linode: 1,
      nodebalancer: 1,
      public_interface: 1,
      vpc_interface: 1,
    },
  });

export const firewallRuleSetFactory = Factory.Sync.makeFactory<FirewallRuleSet>(
  {
    created: '2025-11-05T00:00:00',
    deleted: null,
    description: Factory.each((i) => `firewall-ruleset-${i} description`),
    label: Factory.each((i) => `firewall-ruleset-${i}`),
    is_service_defined: false,
    id: Factory.each((i) => i),
    type: 'inbound',
    rules: firewallRuleFactory.buildList(3),
    updated: '2025-11-05T00:00:00',
    version: 1,
  }
);

export const firewallPrefixListFactory =
  Factory.Sync.makeFactory<FirewallPrefixList>({
    created: '2025-11-05T00:00:00',
    updated: '2025-11-05T00:00:00',
    description: Factory.each((i) => `firewall-prefixlist-${i} description`),
    id: Factory.each((i) => i),
    name: Factory.each((i) => `pl:system:resolvers:test-${i}`),
    version: 1,
    visibility: 'public',
    ipv4: Factory.each((i) =>
      Array.from({ length: 5 }, (_, j) => `139.144.${i}.${j}`)
    ),
    ipv6: Factory.each((i) =>
      Array.from({ length: 5 }, (_, j) => `2600:3c05:e001:bc::${i}${j}`)
    ),
  });
