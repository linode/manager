import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

import type { Invoice, Payment } from '@linode/api-v4/lib/account';
import type { APIError, Filter, Params } from '@linode/api-v4/lib/types';
import type { EventHandlerData } from '../eventHandlers';

export const useAllAccountInvoices = (
  params: Params = {},
  filter: Filter = {}
) => {
  return useQuery<Invoice[], APIError[]>({
    ...accountQueries.invoices(params, filter),
    ...queryPresets.oneTimeFetch,
    placeholderData: keepPreviousData,
  });
};

export const useAllAccountPayments = (
  params: Params = {},
  filter: Filter = {}
) => {
  return useQuery<Payment[], APIError[]>({
    ...accountQueries.payments(params, filter),
    ...queryPresets.oneTimeFetch,
    placeholderData: keepPreviousData,
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
