import {
  Invoice,
  Payment,
  getInvoices,
  getPayments,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { queryPresets } from './base';

export const queryKey = 'account-billing';

const getAllAccountInvoices = async (
  passedParams: any = {},
  passedFilter: any = {}
) => {
  const res = await getAll<Invoice>((params, filter) =>
    getInvoices({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )();
  return res.data;
};

const getAllAccountPayments = async (
  passedParams: any = {},
  passedFilter: any = {}
) => {
  const res = await getAll<Payment>((params, filter) =>
    getPayments({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )();
  return res.data;
};

export const useAllAccountInvoices = (params: any = {}, filter: any = {}) => {
  return useQuery<Invoice[], APIError[]>(
    [`${queryKey}-invoices`, params, filter],
    () => getAllAccountInvoices(params, filter),
    {
      ...queryPresets.oneTimeFetch,
      keepPreviousData: true,
    }
  );
};

export const useAllAccountPayments = (params: any = {}, filter: any = {}) => {
  return useQuery<Payment[], APIError[]>(
    [`${queryKey}-payments`, params, filter],
    () => getAllAccountPayments(params, filter),
    {
      ...queryPresets.oneTimeFetch,
      keepPreviousData: true,
    }
  );
};
