export interface Firewall {
  id: number;
  status: 'enabled' | 'disabled' | 'deleted';
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
  protocol: 'ALL' | 'TCP' | 'UDP' | 'ICMP';
  start_port: number;
  end_port?: null | number;
  sequence: number;
  addresses?: null | {
    ipv4?: null | string[];
    ipv6?: null | string[];
  };
}

export interface FirewallDevices {
  linodes: number[];
}
