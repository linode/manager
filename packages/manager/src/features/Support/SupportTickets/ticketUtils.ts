import { getTickets } from '@linode/api-v4/lib/support';

import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';

import {
  ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP,
  SMTP_FIELD_NAME_TO_LABEL_MAP,
  TICKET_TYPE_TO_CUSTOM_FIELD_KEYS_MAP,
} from './constants';

import type {
  AllSupportTicketFormFields,
  SupportTicketFormFields,
  TicketType,
} from './SupportTicketDialog';
import type { Filter, Params } from '@linode/api-v4';

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

/**
 * formatDescription
 *
 * When variant ticketTypes include additional fields, fields must concat to one description string to submit in the payload.
 * For readability, replace field names with field labels and format the description in Markdown.
 * @param values - the form payload, which can either be the general fields, or the general fields plus any custom fields
 * @param ticketType - either 'general' or a custom ticket type (e.g. 'smtp')
 *
 * @returns a description string
 */
export const formatDescription = (
  values: AllSupportTicketFormFields | SupportTicketFormFields,
  ticketType: TicketType
) => {
  type customFieldTuple = [string, string | undefined];
  const customFields: customFieldTuple[] = Object.entries(
    values
  ).filter(([key, _value]: customFieldTuple) =>
    TICKET_TYPE_TO_CUSTOM_FIELD_KEYS_MAP[ticketType]?.includes(key)
  );

  // If there are no custom fields, just return the initial description.
  if (customFields.length === 0) {
    return values.description;
  }

  // Add all custom fields to the description in the ticket payload, to be viewed on ticket details page and by Customer Support.
  return customFields
    .map(([key, value]) => {
      let label = key;
      if (ticketType === 'smtp') {
        label = SMTP_FIELD_NAME_TO_LABEL_MAP[key];
      } else if (ticketType === 'accountLimit') {
        label = ACCOUNT_LIMIT_FIELD_NAME_TO_LABEL_MAP[key];
      }
      return `**${label}**\n${value ? value : 'No response'}`;
    })
    .join('\n\n');
};
