import React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

import { AGLB_DOCS } from '../../constants';

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

export const protocolOptions = [
  { label: 'HTTPS', value: 'https' },
  { label: 'HTTP', value: 'http' },
  { label: 'TCP', value: 'tcp' },
];

export const CONFIGURATION_COPY = {
  Certificates:
    'TLS termination certificates create an encrypted link between your clients and Global Load Balancer, and terminate incoming traffic on the load balancer. Once the load balancing policy is applied, traffic is forwarded to your service targets over encrypted TLS connections. Responses from your service targets to your clients are also encrypted.',
  Port:
    'Set the inbound port value that the load balancer listens on to whichever port the client software will connect to. The port can be 1-65535.',
  Protocol: (
    <Typography>
      Set to either TCP, HTTP, or HTTPS. See{' '}
      <Link to={AGLB_DOCS.Protocols}>Available Protocols</Link> for information.
    </Typography>
  ),
  configuration:
    'If a label is not entered, a default value based on protocol or port number is assigned.',
};
