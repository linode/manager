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
  // TODO: AGLB - I don't like an optional entrypoints field but it'll do for now
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
  default_target: ServiceTargetPayload;
}

export interface Route extends RoutePayload {
  id: number;
}

export interface EntrypointPayload {
  label: string;
  port: number;
  protocol: Protocol;
  certificate_table: CertificateTable[];
  // TODO: AGLB - is it how we want to do it?
  // for updating an entrypoint we want a list of IDs,
  // but when creating a load balancer with all children it needs the full payload
  // maybe we should have a different type for each case but for now I'll just use this
  routes: RoutePayload[] | Route['id'][];
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
  match_condition: MatchCondition;
  service_targets: ServiceTargetPayload[];
}

export interface MatchCondition {
  host: string;
  path: string;
}

export interface RouteServiceTargetPayload {
  service_target_name: string;
  service_target_percentage: number;
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

// TODO: AGLB - I don't know if we gonna need this, but the RoutePayload differs when creating an entrypoint
// Hopefully this is a mistake in the in-progress API docs and we can consolidate these types
// For now I care to match the API docs for the factories
export interface RoutePayload2 {
  label: string;
  rules: Rule2[];
}

export interface Route2 extends RoutePayload2 {
  id: number;
}

export interface Rule2 {
  match_condition: MatchCondition;
  service_targets: ServiceTargetPayload2[];
}

export interface ServiceTargetPayload2 {
  service_target_name: string;
  service_target_percentage: number;
}
