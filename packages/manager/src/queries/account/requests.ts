import {
  AccountMaintenance,
  Filter,
  Params,
  getAccountMaintenance,
  getNotifications,
  getPaymentMethods,
} from '@linode/api-v4';

import { getAll } from 'src/utilities/getAll';

import type { Notification, PaymentMethod } from '@linode/api-v4';

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
