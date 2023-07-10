export interface Loadbalancer {
  id: number;
  tags: string[];
  label: string;
  regions: string[];
  entrypoints: string[];
}

interface LoadbalancerPayload {
  label: string;
  regions: string[];
  tags?: string[];
}

export interface CreateLoadbalancerPayload extends LoadbalancerPayload {
  entrypoints?: EntrypointPayload[];
}

export interface UpdateLoadbalancerPayload extends LoadbalancerPayload {
  entrypoints: number[];
}

type Protocol = 'TCP' | 'HTTP' | 'HTTPS';

type Policy = 'ROUND_ROBIN';

export interface RoutePayload {
  label: string;
  rules: Rule[];
}

export interface Route extends RoutePayload {
  id: number;
}

export interface EntrypointPayload {
  label: string;
  port: number;
  protocol: Protocol;
  certificate_table: CertificateTable[];
  routes: RoutePayload[];
}

export type CreateEntrypointPayload = Omit<EntrypointPayload, 'routes'>;

export interface Entrypoint {
  id: number;
  label: string;
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
  label: string;
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
