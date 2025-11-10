export type FirewallStatus = 'deleted' | 'disabled' | 'enabled';

export type FirewallRuleProtocol = 'ALL' | 'ICMP' | 'IPENCAP' | 'TCP' | 'UDP';

export type FirewallDeviceEntityType =
  | 'linode'
  | 'linode_interface'
  | 'nodebalancer';

export type FirewallPolicyType = 'ACCEPT' | 'DROP';

export interface Firewall {
  created: string;
  entities: FirewallDeviceEntity[];
  id: number;
  label: string;
  rules: FirewallRules;
  status: FirewallStatus;
  tags: string[];
  updated: string;
}

export interface FirewallRules {
  fingerprint: string;
  inbound?: FirewallRuleType[] | null;
  inbound_policy: FirewallPolicyType;
  outbound?: FirewallRuleType[] | null;
  outbound_policy: FirewallPolicyType;
  version: number;
}

export type UpdateFirewallRules = Omit<
  FirewallRules,
  'fingerprint' | 'version'
>;

export type FirewallTemplateRules = UpdateFirewallRules;

export interface FirewallRuleType {
  action?: FirewallPolicyType | null;
  addresses?: null | {
    ipv4?: null | string[];
    ipv6?: null | string[];
  };
  description?: null | string;
  label?: null | string;
  ports?: null | string;
  protocol?: FirewallRuleProtocol | null;
  ruleset?: null | number;
}

export interface FirewallDeviceEntity {
  id: number;
  label: null | string;
  parent_entity: FirewallDeviceEntity | null;
  type: FirewallDeviceEntityType;
  url: string;
}

export interface FirewallDevice {
  created: string;
  entity: FirewallDeviceEntity;
  id: number;
  updated: string;
}

export type FirewallTemplateSlug = 'akamai-non-prod' | 'public' | 'vpc';

export interface FirewallTemplate {
  rules: FirewallTemplateRules;
  slug: FirewallTemplateSlug;
}

export interface CreateFirewallPayload {
  devices?: null | {
    linode_interfaces?: number[];
    linodes?: number[];
    nodebalancers?: number[];
  };
  label: string;
  rules: UpdateFirewallRules;
  tags?: string[];
}

export interface UpdateFirewallPayload {
  label?: string;
  status?: Omit<FirewallStatus, 'deleted'>;
  tags?: string[];
}

export interface FirewallDevicePayload {
  id: number;
  type: FirewallDeviceEntityType;
}

export interface DefaultFirewallIDs {
  linode: null | number;
  nodebalancer: null | number;
  public_interface: null | number;
  vpc_interface: null | number;
}

export interface FirewallSettings {
  default_firewall_ids: DefaultFirewallIDs;
}

export interface UpdateFirewallSettings {
  default_firewall_ids: Partial<DefaultFirewallIDs>;
}

export interface FirewallRuleSet {
  created: string;
  deleted: null | string;
  description: string;
  id: number;
  is_service_defined: boolean;
  label: string;
  rules: FirewallRuleType[];
  type: string;
  updated: string;
  version: number;
}

export type FirewallPrefixListVisibility = 'private' | 'public' | 'restricted';

export interface FirewallPrefixList {
  created: string;
  description: string;
  id: number;
  ipv4?: null | string[];
  ipv6?: null | string[];
  name: string;
  updated: string;
  version: number;
  visibility: FirewallPrefixListVisibility;
}
