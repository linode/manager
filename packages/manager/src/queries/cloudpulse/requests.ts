import {
  getAlertDefinitionByServiceType,
  getAlertDefinitions,
  getAlertsByNotificationChannelId,
  getNotificationChannels,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type {
  Alert,
  Filter,
  NotificationChannel,
  NotificationChannelAlerts,
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

export const getAllAlertsByNotificationChannelId = (channelId: number) =>
  getAll<NotificationChannelAlerts>((_params, _filter) =>
    getAlertsByNotificationChannelId(channelId, _params, _filter)
  )().then(({ data }) => data);
