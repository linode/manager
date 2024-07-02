import { TicketSeverity } from '@linode/api-v4';

export const severityLabelMap: Map<TicketSeverity, string> = new Map([
  [1, '1-Major Impact'],
  [2, '2-Moderate Impact'],
  [3, '3-Low Impact'],
]);
