export const DASHBOARD_ID = 'dashboardId';

export const PRIMARY_NODE = 'primary';

export const SECONDARY_NODE = 'secondary';

export const REGION = 'region';

export const RESOURCES = 'resources';

export const INTERVAL = 'interval';

export const TIME_DURATION = 'dateTimeDuration';

export const AGGREGATE_FUNCTION = 'aggregateFunction';

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

export const PORTS_LIMIT_ERROR_MESSAGE = 'Enter a maximum of 15 port numbers';

export const PORTS_PLACEHOLDER_TEXT = 'e.g., 80,443,3000';

export const INTERFACE_IDS_HELPER_TEXT =
  'Enter one or more interface ids separated by commas.';

export const INTERFACE_IDS_ERROR_MESSAGE =
  'Enter valid interface id numbers as integers separated by commas.';

export const INTERFACE_IDS_CONSECUTIVE_COMMAS_ERROR_MESSAGE =
  'Use a single comma to separate interface ids.';

export const INTERFACE_IDS_LEADING_COMMA_ERROR_MESSAGE =
  'First character must be an integer.';

export const INTERFACE_IDS_LIMIT_ERROR_MESSAGE =
  'Enter a maximum of 15 interface ids';

export const INTERFACE_IDS_PLACEHOLDER_TEXT = 'e.g., 0,1';
export const NO_REGION_MESSAGE: Record<string, string> = {
  dbaas: 'No database clusters configured in any regions.',
  linode: 'No linodes configured in any regions.',
};

export const HELPER_TEXT: Record<string, string> = {
  [PORT]: PORTS_HELPER_TEXT,
  [INTERFACE_ID]: INTERFACE_IDS_HELPER_TEXT,
};

export const PLACEHOLDER_TEXT: Record<string, string> = {
  [PORT]: PORTS_PLACEHOLDER_TEXT,
  [INTERFACE_ID]: INTERFACE_IDS_PLACEHOLDER_TEXT,
};
