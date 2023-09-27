import type { MatchField } from '@linode/api-v4';

export const matchFieldMap: Record<MatchField, string> = {
  header: 'HTTP Header',
  host: 'Host',
  method: 'HTTP Method',
  path_prefix: 'Path',
  query: 'Query String',
};

export const matchValuePlaceholder: Record<MatchField, string> = {
  header: 'X-route-header=images',
  host: '',
  method: 'POST',
  path_prefix: '/images',
  query: '?svc=images',
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
