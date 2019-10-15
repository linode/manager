export type FirewallStatus = 'enabled' | 'disabled' | 'deleted';

export type FirewallRuleProtocol = 'ALL' | 'TCP' | 'UDP' | 'ICMP';

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
  type: 'linode' | 'nodebalancer';
  label: string;
  url: string;
}

export interface FirewallDevice {
  id: number;
  entity: FirewallDeviceEntity;
}
