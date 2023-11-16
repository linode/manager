import type { Configuration } from '@linode/api-v4';

export function getConfigurationPayloadFromConfiguration(
  configuration: Configuration
) {
  return {
    certificates: configuration.certificates,
    label: configuration.label,
    port: configuration.port,
    protocol: configuration.protocol,
    route_ids: configuration.routes.map((r) => r.id),
  };
}

export const initialValues = {
  certificates: [],
  label: '',
  port: 443,
  protocol: 'https' as const,
  route_ids: [],
};

export const CONFIGURATION_COPY = {
  Certificates:
    'TLS termination certificates create an encrypted link between your clients and Global Load Balancer and terminate incoming traffic on the load balancer. Once the load balancing policy is applied, traffic is forwarded to your service targets over encrypted TLS connections. Responses from your service targets to your clients are also encrypted.',
};
