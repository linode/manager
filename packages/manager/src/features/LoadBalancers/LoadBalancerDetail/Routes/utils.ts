import type { MatchField, Rule, RulePayload } from '@linode/api-v4';

export const matchFieldMap: Record<MatchField, string> = {
  header: 'HTTP Header',
  host: 'Host',
  method: 'HTTP Method',
  path_prefix: 'Path',
  query: 'Query String',
};

export const matchValuePlaceholder: Record<MatchField, string> = {
  header: 'x-my-header=this',
  host: 'example.com',
  method: 'POST',
  path_prefix: '/my-path',
  query: '?my-query-param=this',
};

export const matchTypeOptions = Object.keys(matchFieldMap).map(
  (key: MatchField) => ({
    label: matchFieldMap[key],
    value: key,
  })
);

export const stickyOptions = [
  { label: 'Load Balancer Generated' },
  { label: 'Origin' },
] as const;

export const defaultServiceTarget = {
  id: -1,
  percentage: 100,
};

export const initialValues = {
  match_condition: {
    hostname: '',
    match_field: 'path_prefix' as const,
    match_value: '',
    session_stickiness_cookie: null,
    session_stickiness_ttl: null,
  },
  service_targets: [defaultServiceTarget],
};

export const getIsSessionStickinessEnabled = (rule: Rule | RulePayload) => {
  return (
    rule.match_condition.session_stickiness_cookie !== null ||
    rule.match_condition.session_stickiness_ttl !== null
  );
};

export const timeUnitFactorMap = {
  day: 86_400_000,
  hour: 3_600_000,
  millisecond: 1,
  minute: 60000,
  second: 1000,
};

export type TimeUnit = keyof typeof timeUnitFactorMap;

export const timeUnitOptions = Object.keys(timeUnitFactorMap).map(
  (key: TimeUnit) => ({
    label: key,
    value: timeUnitFactorMap[key],
  })
);
