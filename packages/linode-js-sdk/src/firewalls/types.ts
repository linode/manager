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
  start_port: number;
  end_port?: null | number;
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
  entity: FirewallDeviceEntity;
}

export interface CreateFirewallPayload {
  label?: string;
  tags?: string[];
  rules: FirewallRules;
}

export interface UpdateFirewallPayload {
  label?: string;
  tags?: string[];
  status?: FirewallStatus;
}

export interface FirewallDevicePayload {
  id: number;
  type: FirewallDeviceEntityType;
}
