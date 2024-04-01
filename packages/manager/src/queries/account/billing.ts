import { Invoice, Payment } from '@linode/api-v4/lib/account';
import { APIError, Filter, Params } from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

import { queryPresets } from '../base';
import { accountQueries } from './queries';

export const useAllAccountInvoices = (
  params: Params = {},
  filter: Filter = {}
) => {
  return useQuery<Invoice[], APIError[]>({
    ...accountQueries.invoices(params, filter),
    ...queryPresets.oneTimeFetch,
    keepPreviousData: true,
  });
};

export const useAllAccountPayments = (
  params: Params = {},
  filter: Filter = {}
) => {
  return useQuery<Payment[], APIError[]>({
    ...accountQueries.payments(params, filter),
    ...queryPresets.oneTimeFetch,
    keepPreviousData: true,
  });
};
