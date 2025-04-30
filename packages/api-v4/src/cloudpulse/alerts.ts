import {
  createAlertDefinitionSchema,
  editAlertDefinitionSchema,
} from '@linode/validation';
import Request, {
  setURL,
  setMethod,
  setData,
  setParams,
  setXFilter,
} from '../request';
import {
  Alert,
  AlertServiceType,
  CreateAlertDefinitionPayload,
  EditAlertDefinitionPayload,
  NotificationChannel,
} from './types';
import { BETA_API_ROOT as API_ROOT } from '../constants';
import { Params, Filter, ResourcePage } from '../types';

export const createAlertDefinition = (
  data: CreateAlertDefinitionPayload,
  serviceType: AlertServiceType
) =>
  Request<Alert>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType!
      )}/alert-definitions`
    ),
    setMethod('POST'),
    setData(data, createAlertDefinitionSchema)
  );

export const getAlertDefinitions = (params?: Params, filters?: Filter) =>
  Request<ResourcePage<Alert>>(
    setURL(`${API_ROOT}/monitor/alert-definitions`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );

export const getAlertDefinitionByServiceTypeAndId = (
  serviceType: string,
  alertId: string
) =>
  Request<Alert>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType
      )}/alert-definitions/${encodeURIComponent(alertId)}`
    ),
    setMethod('GET')
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
    setXFilter(filters)
  );

export const getAlertDefinitionByServiceType = (serviceType: string) =>
  Request<ResourcePage<Alert>>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType
      )}/alert-definitions`
    ),
    setMethod('GET')
  );

export const addEntityToAlert = (
  serviceType: string,
  entityId: string,
  data: { 'alert-definition-id': number }
) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/monitor/service/${encodeURIComponent(
        serviceType
      )}/entity/${encodeURIComponent(entityId)}/alert-definition`
    ),
    setMethod('POST'),
    setData(data)
  );

export const deleteEntityFromAlert = (
  serviceType: string,
  entityId: string,
  alertId: number
) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/monitor/service/${encodeURIComponent(
        serviceType
      )}/entity/${encodeURIComponent(
        entityId
      )}/alert-definition/${encodeURIComponent(alertId)}`
    ),
    setMethod('DELETE')
  );

export const deleteAlertDefinition = (serviceType: string, alertId: number) =>
  Request<Alert>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(serviceType)}/alert-definitions/${encodeURIComponent(alertId)}`,
    ),
    setMethod('DELETE'),
  );
