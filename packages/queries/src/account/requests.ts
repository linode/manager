import {
  getAccountAvailabilities,
  getAccountMaintenance,
  getInvoices,
  getNotifications,
  getPaymentMethods,
  getPayments,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type {
  AccountAvailability,
  AccountMaintenance,
  Filter,
  Invoice,
  Notification,
  Params,
  Payment,
  PaymentMethod,
} from '@linode/api-v4';

export const getAllNotifications = () =>
  getAll<Notification>(getNotifications)().then((data) => data.data);

export const getAllPaymentMethodsRequest = () =>
  getAll<PaymentMethod>(getPaymentMethods)().then((data) => data.data);

export const getAllAccountMaintenance = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<AccountMaintenance>((params, filter) =>
    getAccountMaintenance(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((res) => res.data);

export const getAllAccountInvoices = async (
  passedParams: Params = {},
  passedFilter: Filter = {}
) => {
  const res = await getAll<Invoice>((params, filter) =>
    getInvoices({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )();
  return res.data;
};

export const getAllAccountPayments = async (
  passedParams: Params = {},
  passedFilter: Filter = {}
) => {
  const res = await getAll<Payment>((params, filter) =>
    getPayments({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )();
  return res.data;
};

export const getAllAccountAvailabilitiesRequest = () =>
  getAll<AccountAvailability>((params, filters) =>
    getAccountAvailabilities(params, filters)
  )().then((data) => data.data);
