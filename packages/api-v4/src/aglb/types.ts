export interface Loadbalancer {
  id: number;
  tags: string[];
  name: string;
  regions: string[];
  'entry-points': string[];
}

export interface CreateLoadbalancerPayload {
  name: string;
  regions: string[];
  entrypoints: EntrypointPayload[];
}

export interface UpdateLoadbalancerPayload {
  name: string;
  regions: string[];
  entrypoints: number[];
}

type Protocol = 'TCP' | 'HTTP' | 'HTTPS';

export interface EntrypointPayload {
  name: string;
  port: number;
  protocol: Protocol;
  certificate_table: CertificateTable[];
  routes: RoutePayload[];
}

export interface RoutePayload {
  name: string;
  rules: Rule[];
}

export interface Entrypoint {
  id: number;
  name: string;
  port: number;
  protocol: Protocol;
  certificate_table: CertificateTable[];
  routes: string[];
}

export interface CertificateTable {
  sniHostname: string;
  certificateId: string;
}

export interface Route extends RoutePayload {
  id: number;
}

export interface Rule {
  match: Match;
  service_targets: ServiceTargetPayload[];
}

export interface Match {
  hostname: string;
  matchField: string;
  matchValue: string;
}

export interface ServiceTargetPayload {
  name: string;
  service_target_percentage: number;
  endpoints: Endpoint[];
  ca_certificate: string;
  load_balancing_policy: string;
  health_check_interval: number;
  health_check_timeout: number;
  health_check_unhealthy_thresh: number;
  health_check_healthy_thresh: number;
  health_check_path: string;
  health_check_host: string;
}

export interface ServiceTarget extends ServiceTargetPayload {
  id: number;
}

export interface Endpoint {
  endpoint_IP?: string;
  endpoint_port?: number;
  endpoint_rate_capacity: number;
  endpoint_rate_limit: number;
  host?: string;
  port?: number;
  endpoint_host?: string;
  endpoint_dns_name?: string;
  dnsName?: string;
}
