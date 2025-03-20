export type FirewallStatus = 'enabled' | 'disabled' | 'deleted';

export type FirewallRuleProtocol = 'ALL' | 'TCP' | 'UDP' | 'ICMP' | 'IPENCAP';

export type FirewallDeviceEntityType = 'linode' | 'nodebalancer' | 'interface';

export type FirewallPolicyType = 'ACCEPT' | 'DROP';

export interface Firewall {
  id: number;
  status: FirewallStatus;
  label: string;
  tags: string[];
  rules: FirewallRules;
  created: string;
  updated: string;
  entities: FirewallDeviceEntity[];
}

export interface FirewallRules {
  fingerprint: string;
  inbound?: FirewallRuleType[] | null;
  outbound?: FirewallRuleType[] | null;
  inbound_policy: FirewallPolicyType;
  outbound_policy: FirewallPolicyType;
  version: number;
}

export type UpdateFirewallRules = Omit<
  FirewallRules,
  'fingerprint' | 'version'
>;

export type FirewallTemplateRules = UpdateFirewallRules;

export interface FirewallRuleType {
  label?: string | null;
  description?: string | null;
  protocol: FirewallRuleProtocol;
  ports?: string;
  action: FirewallPolicyType;
  addresses?: null | {
    ipv4?: null | string[];
    ipv6?: null | string[];
  };
}

export interface FirewallDeviceEntity {
  id: number;
  type: FirewallDeviceEntityType;
  label: string;
  url: string;
}

export interface FirewallDevice {
  id: number;
  created: string;
  updated: string;
  entity: FirewallDeviceEntity;
}

export type FirewallTemplateSlug = 'akamai-non-prod' | 'vpc' | 'public';

export interface FirewallTemplate {
  slug: FirewallTemplateSlug;
  rules: FirewallTemplateRules;
}

export interface CreateFirewallPayload {
  label: string;
  tags?: string[];
  rules: UpdateFirewallRules;
  devices?: {
    linodes?: number[];
    nodebalancers?: number[];
    interfaces?: number[];
  } | null;
}

export interface UpdateFirewallPayload {
  label?: string;
  tags?: string[];
  status?: Omit<FirewallStatus, 'deleted'>;
}

export interface FirewallDevicePayload {
  id: number;
  type: FirewallDeviceEntityType;
}

export interface DefaultFirewallIDs {
  public_interface: number | null;
  vpc_interface: number | null;
  linode: number | null;
  nodebalancer: number | null;
}

export interface FirewallSettings {
  default_firewall_ids: DefaultFirewallIDs;
}

export interface UpdateFirewallSettings {
  default_firewall_ids: Partial<DefaultFirewallIDs>;
}
