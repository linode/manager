import React from 'react';

import { Box } from 'src/components/Box';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';

import type { ServiceTargetPayload } from '@linode/api-v4';

export const algorithmOptions = [
  {
    description:
      'Service targets are selected one after another in a repeating order. If unequal weights are assigned, service targets with a greater weight appear more frequently in the round robin rotation.',
    label: 'Round Robin',
    value: 'round_robin',
  },
  {
    description:
      'The service target with the fewest number of active requests is selected. If unequal weights are assigned, weighted round robin rotation is applied.',
    label: 'Least Request',
    value: 'least_request',
  },
  {
    description:
      'Each service target is mapped into a circle (ring) by hashing its address. Each request is then routed clockwise around the ring to the nearest service target.',
    label: 'Ring Hash',
    value: 'ring_hash',
  },
  {
    description: 'A random available service target is selected.',
    label: 'Random',
    value: 'random',
  },
  {
    description:
      'Reads the upstream hash to make content-aware routing decisions.',
    label: 'Maglev',
    value: 'maglev',
  },
];

export const protocolOptions = [
  { label: 'TCP', value: 'tcp' },
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' },
];

export const initialValues: ServiceTargetPayload = {
  certificate_id: null,
  endpoints: [],
  healthcheck: {
    healthy_threshold: 3,
    host: '',
    interval: 10,
    path: '',
    protocol: 'http',
    timeout: 5,
    unhealthy_threshold: 3,
  },
  label: '',
  load_balancing_policy: 'round_robin',
  percentage: 10,
  protocol: 'https',
};

export const SERVICE_TARGET_COPY = {
  Description:
    'Configuration for a new service target and its endpoints that the load balancer directs incoming requests to.',
  Tooltips: {
    Algorithm:
      'Policy type that decides how the load balancer allocates new connections across your service targets.',
    Certificate:
      'Service target CA certificates are installed on your endpoints. Global Load Balancer uses these certificates to verify responses from your service targets to your clients.',
    Endpoints: {
      Capacity:
        'The maximum number of requests/second that can be directed to this endpoint. If the actual number of requests/second exceeds the configured capacity value, requests are distributed to the other endpoints.',
      Host:
        'Optional host header for HTTP/S requests to the endpoint. Not used to look up the IP address in the DNS.',
      IP:
        'The private IP address of the endpoint on a Compute Instance (Linode). For non-Linode endpoints, enter the public IPv4 or IPv6 address. Do not use 127.0.0.0/8 for the endpoint IP address.',
      Port:
        'The service target port that the load balancer directs incoming requests to. This is the port that the application is listening on.',
    },
    Healthcheck: {
      Description:
        'Health checks query the service targets by performing TCP connections or by making HTTP/S requests. For TCP, a service target is considered healthy and able to accept incoming requests when there is a successful TCP handshake with the service target. When HTTP/S is used to validate health status, the service target is considered healthy when requests to its path or host return a 2xx or 3xx status code response.',
      Healthy:
        'The number of consecutive health checks that must be successful in order to consider a service target as healthy. Minimum value is 1.',
      Host: (
        <Stack spacing={1}>
          <Typography>
            When the Protocol is set to HTTP/S, enter the request host for the
            health check.
          </Typography>
          <Typography>
            Health Check Host is not applicable when the health check Protocol
            is set to TCP.
          </Typography>
        </Stack>
      ),
      Interval:
        'The number of seconds between health checks for this service target. Minimum value is 1.',
      Path: (
        <Stack spacing={1}>
          <Typography>
            When the Protocol is set to HTTP/S, enter the request url path for
            the health check.
          </Typography>
          <Typography>
            Health Check Path is not applicable when the health check Protocol
            is set to TCP.
          </Typography>
        </Stack>
      ),
      Protocol: (
        <Stack spacing={2}>
          <Typography>
            An HTTP/S health check verifies health status by sending requests to
            the endpoint Health Check Path or Health Check Host.
          </Typography>
          <Typography>
            A TCP health check verifies health status by connecting to the
            endpoints port. When set to TCP, Health Check Path and Health Check
            Host are not applicable.
          </Typography>
          <Typography>
            You can select TCP health checks even when the load balancer's entry
            point protocol is HTTP or HTTPS.
          </Typography>
        </Stack>
      ),
      Timeout:
        'How long to wait (in seconds) before canceling a health check because a connection could not be established with the service target. Minimum value is 1.',
      Unhealthy:
        'The number of consecutive health checks that must fail to consider a service target as unhealthy. Minimum value is 1.',
    },
    Protocol: (
      <Box>
        The protocol this target is configured to serve.
        <ul>
          <li>The HTTP and TCP protocols do not support TLS certificates.</li>
          <li> HTTPS requires TLS certificates.</li>
        </ul>
      </Box>
    ),
  },
};
