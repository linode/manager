import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

import type { EventHandlerData } from '../eventHandlers';
import type { Invoice, Payment } from '@linode/api-v4/lib/account';
import type { APIError, Filter, Params } from '@linode/api-v4/lib/types';

export const useAllAccountInvoices = (
  params: Params = {},
  filter: Filter = {},
  enabled?: boolean,
) => {
  return useQuery<Invoice[], APIError[]>({
    ...accountQueries.invoices(params, filter),
    ...queryPresets.oneTimeFetch,
    placeholderData: keepPreviousData,
    enabled: enabled ?? true,
  });
};

export const useAllAccountPayments = (
  params: Params = {},
  filter: Filter = {},
  enabled?: boolean,
) => {
  return useQuery<Payment[], APIError[]>({
    ...accountQueries.payments(params, filter),
    ...queryPresets.oneTimeFetch,
    placeholderData: keepPreviousData,
    enabled: enabled ?? true,
  });
};

export const taxIdEventHandler = ({
  event,
  invalidateQueries,
}: EventHandlerData) => {
  if (event.action === 'tax_id_invalid' || event.action === 'tax_id_valid') {
    invalidateQueries({
      queryKey: accountQueries.notifications.queryKey,
    });
  }
};
