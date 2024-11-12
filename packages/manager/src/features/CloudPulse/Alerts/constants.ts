import type { AlertSeverityType } from '@linode/api-v4';

export interface Item<T = number | string, L = string> {
  data?: any;
  label: L;
  value: T;
}
export const alertSeverityOptions: Item<AlertSeverityType>[] = [
  { label: 'Info', value: 3 },
  { label: 'Low', value: 2 },
  { label: 'Medium', value: 1 },
  { label: 'Severe', value: 0 },
];
