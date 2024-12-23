import type { Algorithm, Protocol, Stickiness } from '@linode/api-v4';

export const ALGORITHM_HELPER_TEXT: Record<Algorithm, string> = {
  leastconn:
    'Least connections assigns connections to the backend with the least connections.',
  ring_hash: '', // @todo M3-9019 - Add copy as part of UDP NodeBalancer project
  roundrobin:
    'Round robin distributes connection requests to backend servers in weighted circular order.',
  source: "Source uses the client's IPv4 address.",
};

export const SESSION_STICKINESS_DEFAULTS: Record<Protocol, Stickiness> = {
  http: 'table',
  https: 'table',
  tcp: 'table',
  udp: 'session',
};
