import type { MatchField } from '@linode/api-v4';

export const matchFieldMap: Record<MatchField, string> = {
  header: 'HTTP Header',
  host: 'Host',
  method: 'HTTP Method',
  path_prefix: 'Path',
  query: 'Query String',
};

export const matchTypeOptions = Object.keys(matchFieldMap).map(
  (key: MatchField) => ({
    label: matchFieldMap[key],
    value: key,
  })
);

export const stickyOptions = [
  { label: 'Load Balancer Generated' },
  { label: 'Origin Generated' },
] as const;
