export interface Loadbalancer {
  id: number;
  tags: string[];
  label: string;
  regions: string[];
  hostname: string;
  configurations: {
    id: number;
    label: string;
  }[];
}

export interface CreateLoadbalancerPayload {
  label: string;
  regions: string[];
  tags?: string[];
  configurations?: ConfigurationPayload[];
}

/**
 * TODO: AGLB - remove when we move to full creation flow
 */
export interface CreateBasicLoadbalancerPayload {
  label: string;
}

export interface UpdateLoadbalancerPayload {
  label?: string;
  regions?: string[];
  tags?: string[];
  configuration_ids?: number[];
}

export type Protocol = 'tcp' | 'http' | 'https';

type RouteProtocol = 'tcp' | 'http';

type Policy =
  | 'round_robin'
  | 'least_request'
  | 'ring_hash'
  | 'random'
  | 'maglev';

export type MatchField = 'path_prefix' | 'query' | 'host' | 'header' | 'method';

export interface RoutePayload {
  label: string;
  protocol: Protocol;
  rules: RuleCreatePayload[];
}

export interface Route {
  id: number;
  label: string;
  protocol: RouteProtocol;
  rules: {
    match_condition: MatchCondition;
    service_targets: {
      id: number;
      label: string;
      percentage: number;
    }[];
  }[];
}

export type UpdateRoutePayload = Partial<{
  label: string;
  protocol: RouteProtocol;
  rules: RulePayload[];
}>;

export interface CreateRoutePayload {
  label: string;
  protocol: RouteProtocol;
  rules: RulePayload[];
}

export interface Rule {
  match_condition: MatchCondition;
  service_targets: {
    id: number;
    label: string;
    percentage: number;
  }[];
}

export interface RulePayload {
  match_condition: MatchCondition;
  service_targets: {
    id: number;
    label: string;
    percentage: number;
  }[];
}

export interface ConfigurationPayload {
  label: string;
  port: number;
  protocol: Protocol;
  certificates: CertificateConfig[];
  routes?: RoutePayload[];
  route_ids?: number[];
}

export interface Configuration {
  id: number;
  label: string;
  port: number;
  protocol: Protocol;
  certificates: CertificateConfig[];
  routes: { id: number; label: string }[];
}

export type UpdateConfigurationPayload = Partial<{
  label: string;
  port: number;
  protocol: Protocol;
  certificates: CertificateConfig[];
  route_ids: number[];
}>;

export interface CertificateConfig {
  hostname: string;
  id: number;
}

export interface RuleCreatePayload {
  match_condition: MatchCondition;
  service_targets: ServiceTargetPayload[];
}

export interface MatchCondition {
  hostname: string | null;
  match_field: MatchField;
  match_value: string;
  session_stickiness_cookie: string | null;
  session_stickiness_ttl: number | null;
}

export interface RouteServiceTargetPayload {
  service_target_name: string;
  service_target_percentage: number;
}

export interface ServiceTargetPayload {
  label: string;
  protocol: Protocol;
  percentage: number;
  endpoints: Endpoint[];
  certificate_id: number | null;
  load_balancing_policy: Policy;
  healthcheck: HealthCheck;
}

interface HealthCheck {
  protocol: 'tcp' | 'http';
  interval: number;
  timeout: number;
  unhealthy_threshold: number;
  healthy_threshold: number;
  path?: string | null;
  host?: string | null;
}

export interface ServiceTarget extends ServiceTargetPayload {
  id: number;
}

export interface Endpoint {
  ip: string;
  host?: string | null;
  port: number;
  rate_capacity: number;
}

type CertificateType = 'ca' | 'downstream';

export interface Certificate {
  id: number;
  label: string;
  certificate?: string; // Not returned for Alpha
  type: CertificateType;
}

export interface CreateCertificatePayload {
  key?: string;
  certificate: string;
  label: string;
  type: CertificateType;
}

export interface UpdateCertificatePayload {
  key?: string;
  certificate?: string;
  label?: string;
  type?: CertificateType;
}

export interface LoadBalancerEndpointHealth {
  id: number;
  healthy_endpoints: number;
  total_endpoints: number;
  timestamp: string;
}
