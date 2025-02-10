import { createAlertDefinitionSchema } from '@linode/validation';
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
  EditAlertResourcesPayload,
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
  alertId: string
) =>
  Request<Alert>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType
      )}/alert-definitions/${encodeURIComponent(alertId)}`
    ),
    setMethod('PUT'),
    setData(data)
  );
export const getNotificationChannels = (params?: Params, filters?: Filter) =>
  Request<ResourcePage<NotificationChannel>>(
    setURL(`${API_ROOT}/monitor/alert-channels`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );

export const editAlertDefinitionEntities = (
  data: EditAlertResourcesPayload,
  serviceType: string,
  alertId: number
) =>
  Request<Alert>(
    setURL(
      `http://blr-lhvl2d.bangalore.corp.akamai.com:9001/v4beta/monitor/services/${encodeURIComponent(
        serviceType
      )}/alert-definitions/${encodeURIComponent(alertId)}`
    ),
    setMethod('PUT'),
    setData(data)
  );
