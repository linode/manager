/* eslint-disable perfectionist/sort-objects */
import { capitalize } from 'src/utilities/capitalize';

import type {
  Configuration,
  MatchField,
  Route,
  Rule,
  RuleCreatePayload,
  RulePayload,
} from '@linode/api-v4';

type CustomerFacingMatchFieldOption = Exclude<MatchField, 'always_match'>;

export const matchFieldMap: Record<CustomerFacingMatchFieldOption, string> = {
  header: 'HTTP Header',
  method: 'HTTP Method',
  path_prefix: 'Path Prefix',
  path_regex: 'Path Regex',
  query: 'Query String',
};

export const matchValuePlaceholder: Record<
  CustomerFacingMatchFieldOption,
  string
> = {
  header: 'x-my-header:this',
  method: 'POST',
  path_prefix: '/my-path',
  path_regex: '/path/.*[.](jpg)',
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
  label: '',
  percentage: 100,
};

export const defaultTTLUnit = 'second';

export const getInitialValues = (protocol: Route['protocol']) => {
  if (protocol === 'tcp') {
    return { service_targets: [defaultServiceTarget] };
  }
  return {
    match_condition: {
      hostname: '',
      match_field: 'path_prefix' as const,
      match_value: '',
      session_stickiness_cookie: null,
      session_stickiness_ttl: null,
    },
    service_targets: [defaultServiceTarget],
  };
};

export const getIsSessionStickinessEnabled = (
  rule: Rule | RulePayload | RuleCreatePayload
) => {
  return (
    rule.match_condition?.session_stickiness_cookie !== null ||
    rule.match_condition?.session_stickiness_ttl !== null
  );
};

/**
 * Converts some empty strings to `null` in RulePayload
 * so that the API accepts the payload.
 */
export const getNormalizedRulePayload = (rule: RulePayload) => ({
  match_condition: rule.match_condition
    ? {
        ...rule.match_condition,
        hostname: rule.match_condition.hostname
          ? rule.match_condition.hostname
          : null,
      }
    : undefined,
  service_targets: rule.service_targets,
});

export const timeUnitFactorMap = {
  second: 1,
  minute: 60,
  hour: 3_600,
  day: 86_400,
};

export type TimeUnit = keyof typeof timeUnitFactorMap;

export const timeUnitOptions = Object.keys(timeUnitFactorMap).map(
  (key: TimeUnit) => ({
    key,
    label: `${capitalize(key)}s`,
    value: timeUnitFactorMap[key],
  })
);

export const defaultTTL = timeUnitFactorMap['hour'] * 1;

/**
 * Routes can be `http` or `tcp`.
 * Configurations can be `http`, `https`, or `tcp`.
 *
 * Use this function to get the corresponding *route* protocol from a *configuration*
 */
export function getRouteProtocolFromConfigurationProtocol(
  protocol: Configuration['protocol']
): Route['protocol'] {
  if (protocol === 'http' || protocol === 'https') {
    return 'http';
  }
  return 'tcp';
}
