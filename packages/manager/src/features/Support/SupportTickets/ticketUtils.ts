import { Filter, Params } from '@linode/api-v4';
import { TicketSeverity, getTickets } from '@linode/api-v4/lib/support';

import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';

/**
 * getStatusFilter
 *
 * Private helper function to generate an X-Filter object based on a status string.
 *
 * @param ticketStatus { string } status of the tickets to return (open, closed, or all).
 *
 * @example getTicketStatus('closed');
 */
export const getStatusFilter = (ticketStatus: 'all' | 'closed' | 'open') => {
  switch (ticketStatus) {
    case 'open':
      return { '+or': [{ status: 'open' }, { status: 'new' }] };
    case 'closed':
      return { status: 'closed' };
    case 'all':
      return {};
    default:
      return new Error('Argument must be "open", "closed", or "all"');
  }
};

/**
 * getTicketsPage
 *
 * Retrieve a single page of support tickets.
 *
 * @param params { Object } parameters to pass to the API; in most cases these will be pagination parameters
 * @param filters { Object } filters to be passed as the X-Filter header to the API.
 * @param ticketStatus { string } status of the tickets to return (open, closed, or all).
 *
 * @example getTicketsPage({page: 1, pageSize: 25}, false);
 */
export const getTicketsPage = (
  params: Params,
  filters: Filter,
  ticketStatus: 'all' | 'closed' | 'open'
) => {
  const status = getStatusFilter(ticketStatus);
  const ordering = { '+order': 'desc', '+order_by': 'opened' } as const;
  const filter = { ...status, ...ordering, ...filters };
  return getTickets(params, filter);
};

export const useTicketSeverityCapability = () => {
  const flags = useFlags();
  const { account } = useAccountManagement();

  return isFeatureEnabled(
    'Support Ticket Severity',
    Boolean(flags.supportTicketSeverity),
    account?.capabilities ?? []
  );
};

export const severityLabelMap: Map<TicketSeverity, string> = new Map([
  [1, '1-Major Impact'],
  [2, '2-Moderate Impact'],
  [3, '3-Low Impact'],
]);
