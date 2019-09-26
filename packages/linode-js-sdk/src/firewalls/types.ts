export type FirewallStatus = 'enabled' | 'disabled' | 'deleted';

export type FirewallRuleProtocol = 'ALL' | 'TCP' | 'UDP' | 'ICMP';

export interface Firewall {
  id: number;
  status: FirewallStatus;
  label: string;
  tags: string[];
  rules: FirewallRule[];
  created_dt: string;
  updated_dt: string;
  devices: FirewallDevices;
}

export interface FirewallRule {
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

export interface FirewallDevices {
  linodes: number[];
}
