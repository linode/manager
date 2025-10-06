import type { Filter } from '@linode/api-v4';

export const DASHBOARD_ID = 'dashboardId';

export const PRIMARY_NODE = 'primary';

export const SECONDARY_NODE = 'secondary';

export const REGION = 'region';

export const ENTITY_REGION = 'entity_region';

export const ENDPOINT = 'endpoint';

export const LINODE_REGION = 'associated_entity_region';

export const RESOURCES = 'resources';

export const INTERVAL = 'interval';

export const TIME_DURATION = 'dateTimeDuration';

export const AGGREGATE_FUNCTION = 'aggregateFunction';

export const GROUP_BY = 'groupBy';

export const SIZE = 'size';

export const LABEL = 'label';

export const NODE_TYPE = 'node_type';

export const REFRESH = 'refresh';

export const TIME_GRANULARITY = 'timeGranularity';

export const TAGS = 'tags';

export const RELATIVE_TIME_DURATION = 'relative_time_duration';

export const RESOURCE_ID = 'resource_id';

export const WIDGETS = 'widgets';

export const PORT = 'port';

export const INTERFACE_ID = 'interface_id';

export const PORTS_HELPER_TEXT =
  'Enter one or more port numbers (1-65535) separated by commas.';

export const PORTS_ERROR_MESSAGE =
  'Enter valid port numbers as integers separated by commas without spaces.';

export const PORTS_RANGE_ERROR_MESSAGE =
  'Port numbers must be between 1 and 65535.';

export const PORTS_LEADING_ZERO_ERROR_MESSAGE =
  'Leading zeros are not allowed.';

export const PORTS_CONSECUTIVE_COMMAS_ERROR_MESSAGE =
  'Use a single comma to separate port numbers.';

export const PORTS_LEADING_COMMA_ERROR_MESSAGE =
  'First character must be an integer.';

export const PORTS_LIMIT_ERROR_MESSAGE =
  'Port list must be 100 characters or less.';

export const PORTS_PLACEHOLDER_TEXT = 'e.g., 80,443,3000';

export const INTERFACE_IDS_HELPER_TEXT =
  'Enter one or more interface IDs separated by commas.';

export const INTERFACE_IDS_ERROR_MESSAGE =
  'Enter valid interface ID numbers as integers separated by commas.';

export const INTERFACE_IDS_CONSECUTIVE_COMMAS_ERROR_MESSAGE =
  'Use a single comma to separate interface IDs.';

export const INTERFACE_IDS_LEADING_COMMA_ERROR_MESSAGE =
  'First character must be an integer.';

export const INTERFACE_IDS_LIMIT_ERROR_MESSAGE =
  'Interface IDs list must be 100 characters or less.';

export const INTERFACE_IDS_PLACEHOLDER_TEXT = 'e.g., 1234,5678';

export const NO_REGION_MESSAGE: Record<string, string> = {
  dbaas: 'No database clusters configured in any regions.',
  linode: 'No Linodes configured in any regions.',
  nodebalancer: 'No NodeBalancers configured in any regions.',
  firewall: 'No firewalls configured in any Linode regions.',
  objectstorage: 'No Object Storage buckets configured in any region.',
  blockstorage: 'No volumes configured in any regions.',
};

export const HELPER_TEXT: Record<string, string> = {
  [PORT]: PORTS_HELPER_TEXT,
  [INTERFACE_ID]: INTERFACE_IDS_HELPER_TEXT,
};

export const PLACEHOLDER_TEXT: Record<string, string> = {
  [PORT]: PORTS_PLACEHOLDER_TEXT,
  [INTERFACE_ID]: INTERFACE_IDS_PLACEHOLDER_TEXT,
};

export const ORDER_BY_LABLE_ASC = {
  '+order': 'asc',
  '+order_by': 'label',
};

export const RESOURCE_FILTER_MAP: Record<string, Filter> = {
  dbaas: {
    platform: 'rdbms-default',
    ...ORDER_BY_LABLE_ASC,
  },
  linode: {
    ...ORDER_BY_LABLE_ASC,
  },
  nodebalancer: {
    ...ORDER_BY_LABLE_ASC,
  },
  firewall: {
    ...ORDER_BY_LABLE_ASC,
  },
  netloadbalancer: {
    ...ORDER_BY_LABLE_ASC,
  },
  blockstorage: {
    ...ORDER_BY_LABLE_ASC,
  },
};
