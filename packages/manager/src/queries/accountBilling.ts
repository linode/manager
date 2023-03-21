import {
  Invoice,
  Payment,
  getInvoices,
  getPayments,
} from '@linode/api-v4/lib/account';
import { APIError, Filter, Params } from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';
import { getAll } from 'src/utilities/getAll';
import { queryKey } from './account';
import { queryPresets } from './base';

const getAllAccountInvoices = async (
  passedParams: Params = {},
  passedFilter: Filter = {}
) => {
  const res = await getAll<Invoice>((params, filter) =>
    getInvoices({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )();
  return res.data;
};

const getAllAccountPayments = async (
  passedParams: Params = {},
  passedFilter: Filter = {}
) => {
  const res = await getAll<Payment>((params, filter) =>
    getPayments({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )();
  return res.data;
};

export const useAllAccountInvoices = (
  params: Params = {},
  filter: Filter = {}
) => {
  return useQuery<Invoice[], APIError[]>(
    [queryKey, 'billing', 'invoices', params, filter],
    () => getAllAccountInvoices(params, filter),
    {
      ...queryPresets.oneTimeFetch,
      keepPreviousData: true,
    }
  );
};

export const useAllAccountPayments = (
  params: Params = {},
  filter: Filter = {}
) => {
  return useQuery<Payment[], APIError[]>(
    [queryKey, 'billing', 'payments', params, filter],
    () => getAllAccountPayments(params, filter),
    {
      ...queryPresets.oneTimeFetch,
      keepPreviousData: true,
    }
  );
};
