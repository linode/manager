export interface Loadbalancer {
  id: number;
  tags: string[];
  name: string;
  regions: string[];
  entrypoints: string[];
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

type Policy = 'ROUND_ROBIN';

export interface RoutePayload {
  name: string;
  rules: Rule[];
}

export interface Route extends RoutePayload {
  id: number;
}

export interface EntrypointPayload {
  name: string;
  port: number;
  protocol: Protocol;
  certificate_table: CertificateTable[];
  routes: RoutePayload[];
}

export type CreateEntrypointPayload = Omit<EntrypointPayload, 'routes'>;

export interface Entrypoint {
  id: number;
  name: string;
  port: number;
  protocol: Protocol;
  certificate_table: CertificateTable[];
  routes: string[];
}

export interface CertificateTable {
  sni_hostname: string;
  certificate_id: string;
}

export interface Rule {
  match_condition: Match;
  service_targets: ServiceTargetPayload[];
  default_target: ServiceTargetPayload;
}

export interface Match {
  path: string;
}

export interface ServiceTargetPayload {
  name: string;
  endpoints: Endpoint[];
  ca_certificate: string;
  load_balancing_policy: Policy;
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
  ip: string;
  port: number;
  capacity: number;
  hard_rate_limit: number;
}
