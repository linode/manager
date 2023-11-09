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
