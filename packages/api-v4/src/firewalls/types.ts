export type FirewallStatus = 'enabled' | 'disabled' | 'deleted';

export type FirewallRuleProtocol = 'ALL' | 'TCP' | 'UDP' | 'ICMP';

export type FirewallDeviceEntityType = 'linode' | 'nodebalancer';

export interface Firewall {
  id: number;
  status: FirewallStatus;
  label: string;
  tags: string[];
  rules: FirewallRules;
  created_dt: string;
  updated_dt: string;
}

export interface FirewallRules {
  inbound?: FirewallRuleType[] | null;
  outbound?: FirewallRuleType[] | null;
}

export interface FirewallRuleType {
  protocol: FirewallRuleProtocol;
  ports?: string;
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

export interface CreateFirewallPayload {
  label?: string;
  tags?: string[];
  rules: FirewallRules;
  devices?: {
    linodes?: number[];
    nodebalancers?: number[];
  };
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
