import type { Algorithm, Protocol, Stickiness } from '@linode/api-v4';

export interface AlgorithmOption {
  description: string;
  label: string;
  supportedProtocols: Protocol[];
  value: Algorithm;
}

export const ALGORITHM_OPTIONS: AlgorithmOption[] = [
  {
    description:
      'Connections are distributed to the backends in a weighted, circular order.',
    label: 'Round Robin',
    supportedProtocols: ['http', 'https', 'tcp', 'udp'],
    value: 'roundrobin',
  },
  {
    description:
      'Connections are distributed to the backend with the fewest connections.',
    label: 'Least Connections',
    supportedProtocols: ['http', 'https', 'tcp', 'udp'],
    value: 'leastconn',
  },
  {
    description:
      'Each backend node is hashed onto a circle, with requests routed clockwise to the nearest node.',
    label: 'Ring Hash',
    supportedProtocols: ['udp'],
    value: 'ring_hash',
  },
  {
    description:
      'Repeated requests are directed to the same backend based on the client’s IP.',
    label: 'Source',
    supportedProtocols: ['tcp', 'http', 'https'],
    value: 'source',
  },
];

interface StickinessOption {
  description: string;
  label: string;
  supportedProtocols: Protocol[];
  value: Stickiness;
}

export const STICKINESS_OPTIONS: StickinessOption[] = [
  {
    description:
      'Connections are assigned to backends based on the algorithm setting.',
    label: 'None',
    supportedProtocols: ['tcp', 'http', 'https', 'udp'],
    value: 'none',
  },
  {
    description:
      'Packets with the same session identifiers (IPs, ports, time frame) are routed to the same backend.',
    label: 'Session',
    supportedProtocols: ['udp'],
    value: 'session',
  },
  {
    description:
      'The client’s source IP is used to route all packets from that client to the same backend.',
    label: 'Source IP',
    supportedProtocols: ['udp'],
    value: 'source_ip',
  },
  {
    description:
      'Sessions from the same client are routed to the same backend when possible.',
    label: 'Table',
    supportedProtocols: ['tcp', 'http', 'https'],
    value: 'table',
  },
  {
    description:
      'Sessions are routed to the same backend based on a cookie set by the NodeBalancer.',
    label: 'HTTP Cookie',
    supportedProtocols: ['http', 'https'],
    value: 'http_cookie',
  },
];

export const HEALTHCHECK_TYPE_OPTIONS = [
  {
    description: 'No active health check is performed.',
    label: 'None',
    value: 'none',
  },
  {
    description: 'Checks for a successful TCP handshake with a backend node.',
    label: 'TCP Connection',
    value: 'connection',
  },
  {
    description:
      'Performs an HTTP request and checks for a 2xx or 3xx response from the backend node.',
    label: 'HTTP Status',
    value: 'http',
  },
  {
    description:
      'Performs an HTTP request and checks if the regular expression matches the response body.',
    label: 'HTTP Body',
    value: 'http_body',
  },
];

export const SESSION_STICKINESS_DEFAULTS: Record<Protocol, Stickiness> = {
  http: 'table',
  https: 'table',
  tcp: 'table',
  udp: 'session',
};
