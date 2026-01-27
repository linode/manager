import {
  createAlertDefinitionSchema,
  createNotificationChannelPayloadSchema,
  editAlertDefinitionSchema,
  editNotificationChannelPayloadSchema,
} from '@linode/validation';

import { BETA_API_ROOT as API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, Params, ResourcePage } from '../types';
import type {
  Alert,
  CloudPulseAlertsPayload,
  CreateAlertDefinitionPayload,
  CreateNotificationChannelPayload,
  EditAlertDefinitionPayload,
  EditNotificationChannelPayload,
  NotificationChannel,
  NotificationChannelAlerts,
} from './types';

export const createAlertDefinition = (
  data: CreateAlertDefinitionPayload,
  serviceType: string,
) =>
  Request<Alert>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType!,
      )}/alert-definitions`,
    ),
    setMethod('POST'),
    setData(data, createAlertDefinitionSchema),
  );

export const getAlertDefinitions = (params?: Params, filters?: Filter) =>
  Request<ResourcePage<Alert>>(
    setURL(`${API_ROOT}/monitor/alert-definitions`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

export const getAlertDefinitionByServiceTypeAndId = (
  serviceType: string,
  alertId: string,
) =>
  Request<Alert>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType,
      )}/alert-definitions/${encodeURIComponent(alertId)}`,
    ),
    setMethod('GET'),
  );

export const editAlertDefinition = (
  data: EditAlertDefinitionPayload,
  serviceType: string,
  alertId: number,
) =>
  Request<Alert>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType,
      )}/alert-definitions/${encodeURIComponent(alertId)}`,
    ),
    setMethod('PUT'),
    setData(data, editAlertDefinitionSchema),
  );
export const getNotificationChannels = (params?: Params, filters?: Filter) =>
  Request<ResourcePage<NotificationChannel>>(
    setURL(`${API_ROOT}/monitor/alert-channels`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );

export const getAlertDefinitionByServiceType = (serviceType: string) =>
  Request<ResourcePage<Alert>>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType,
      )}/alert-definitions`,
    ),
    setMethod('GET'),
  );

export const addEntityToAlert = (
  serviceType: string,
  entityId: string,
  data: { 'alert-definition-id': number },
) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/monitor/service/${encodeURIComponent(
        serviceType,
      )}/entity/${encodeURIComponent(entityId)}/alert-definition`,
    ),
    setMethod('POST'),
    setData(data),
  );

export const deleteEntityFromAlert = (
  serviceType: string,
  entityId: string,
  alertId: number,
) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/monitor/service/${encodeURIComponent(
        serviceType,
      )}/entity/${encodeURIComponent(
        entityId,
      )}/alert-definition/${encodeURIComponent(alertId)}`,
    ),
    setMethod('DELETE'),
  );

export const deleteAlertDefinition = (serviceType: string, alertId: number) =>
  Request<Alert>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(serviceType)}/alert-definitions/${encodeURIComponent(alertId)}`,
    ),
    setMethod('DELETE'),
  );

export const updateServiceAlerts = (
  serviceType: string,
  entityId: string,
  payload: CloudPulseAlertsPayload,
) =>
  Request<Alert>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(serviceType)}/alert-definitions/${encodeURIComponent(entityId)}`,
    ),
    setMethod('PUT'),
    setData(payload),
  );

export const createNotificationChannel = (
  data: CreateNotificationChannelPayload,
) =>
  Request<NotificationChannel>(
    setURL(`${API_ROOT}/monitor/alert-channels`),
    setMethod('POST'),
    setData(data, createNotificationChannelPayloadSchema),
  );

export const getNotificationChannelById = (channelId: number) =>
  Request<NotificationChannel>(
    setURL(
      `${API_ROOT}/monitor/alert-channels/${encodeURIComponent(channelId)}`,
    ),
    setMethod('GET'),
  );

export const updateNotificationChannel = (
  channelId: number,
  data: EditNotificationChannelPayload,
) =>
  Request<NotificationChannel>(
    setURL(
      `${API_ROOT}/monitor/alert-channels/${encodeURIComponent(channelId)}`,
    ),
    setMethod('PUT'),
    setData(data, editNotificationChannelPayloadSchema),
  );

export const deleteNotificationChannel = (channelId: number) =>
  Request<NotificationChannel>(
    setURL(
      `${API_ROOT}/monitor/alert-channels/${encodeURIComponent(channelId)}`,
    ),
    setMethod('DELETE'),
  );

export const getAlertsByNotificationChannelId = (
  channelId: number,
  params?: Params,
  filters?: Filter,
) =>
  Request<ResourcePage<NotificationChannelAlerts>>(
    setURL(
      `${API_ROOT}/monitor/alert-channels/${encodeURIComponent(channelId)}/alerts`,
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );
