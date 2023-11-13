import type { ServiceTargetPayload } from '@linode/api-v4';

export const algorithmOptions = [
  {
    description: 'Sequential routing to each instance.',
    label: 'Round Robin',
    value: 'round_robin',
  },
  {
    description:
      'Sends requests to the target with the least amount of current connections.',
    label: 'Least Request',
    value: 'least_request',
  },
  {
    description: 'Reads the request hash value and routes accordingly.',
    label: 'Ring Hash',
    value: 'ring_hash',
  },
  {
    description: 'Requests are distributed randomly.',
    label: 'Random',
    value: 'random',
  },
  {
    description:
      'Reads the upstream hash to make content aware routing decisions.',
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
  protocol: 'https',
};
