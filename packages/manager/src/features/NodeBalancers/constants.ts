const ROUND_ROBIN_ALGORITHM_HELPER_TEXT =
  'Round robin distributes connection requests to backend servers in weighted circular order.';

const LEAST_CONNECTIONS_ALGORITHM_HELPER_TEXT =
  'Least connections assigns connections to the backend with the least connections.';

const SOURCE_ALGORITHM_HELPER_TEXT = "Source uses the client's IPv4 address.";

export const ALGORITHM_HELPER_TEXT = {
  leastconn: LEAST_CONNECTIONS_ALGORITHM_HELPER_TEXT,
  ring_hash: '', // @todo M3-9019 - Add copy as part of UDP NodeBalancer project
  roundrobin: ROUND_ROBIN_ALGORITHM_HELPER_TEXT,
  source: SOURCE_ALGORITHM_HELPER_TEXT,
};
