import {
  getAlertDefinitionByServiceType,
  getAlertDefinitions,
  getNotificationChannels,
} from '@linode/api-v4';

import { getAll } from 'src/utilities/getAll';

import type {
  Alert,
  Filter,
  NotificationChannel,
  Params,
} from '@linode/api-v4';

export const getAllAlertsRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Alert>((params, filter) =>
    getAlertDefinitions(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((data) => data.data);

export const getAllertsByServiceTypeRequest = (serviceType: string) =>
  getAll<Alert>((_params, _filter) =>
    getAlertDefinitionByServiceType(serviceType)
  )().then(({ data }) => data);

export const getAllNotificationChannels = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<NotificationChannel>((params, filter) =>
    getNotificationChannels(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then(({ data }) => data);
