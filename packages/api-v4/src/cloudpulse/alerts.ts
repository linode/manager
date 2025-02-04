import { createAlertDefinitionSchema } from '@linode/validation';
import Request, {
  setURL,
  setMethod,
  setData,
  setParams,
  setXFilter,
  setHeaders,
} from '../request';
import {
  Alert,
  AlertServiceType,
  CreateAlertDefinitionPayload,
  EditAlertResourcesPayload,
  NotificationChannel,
} from './types';
import { BETA_API_ROOT as API_ROOT } from '../constants';
import { Params, Filter, ResourcePage } from '../types';

const bearer = 'Bearer vagrant';

export const createAlertDefinition = (
  data: CreateAlertDefinitionPayload,
  serviceType: AlertServiceType
) =>
  Request<Alert>(
    setURL(
      `http://blr-lhvl2d.bangalore.corp.akamai.com:9001/v4beta/monitor/services/${encodeURIComponent(
        serviceType!
      )}/alert-definitions`
    ),
    setMethod('POST'),
    setData(data, createAlertDefinitionSchema),
    setHeaders({
      Authorization: bearer,
    })
  );

export const getAlertDefinitions = (params?: Params, filters?: Filter) =>
  Request<ResourcePage<Alert>>(
    setURL(
      'http://blr-lhvl2d.bangalore.corp.akamai.com:9001/v4beta/monitor/alert-definitions'
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setHeaders({
      Authorization: bearer,
    })
  );

export const getAlertDefinitionByServiceTypeAndId = (
  serviceType: string,
  alertId: number
) =>
  Request<Alert>(
    setURL(
      `http://blr-lhvl2d.bangalore.corp.akamai.com:9001/v4beta/monitor/services/${encodeURIComponent(
        // updating only here as this is the only API ready
        serviceType
      )}/alert-definitions/${encodeURIComponent(alertId)}`
    ),
    setMethod('GET'),
    setHeaders({
      Authorization: bearer,
    })
  );

export const getAlertDefinitionByServiceType = (serviceType: string) =>
  Request<ResourcePage<Alert>>(
    setURL(
      `http://blr-lhvl2d.bangalore.corp.akamai.com:9001/v4beta/monitor/services/${encodeURIComponent(
        serviceType
      )}/alert-definitions`
    ),
    setMethod('GET'),
    setHeaders({
      Authorization: bearer,
    })
  );

export const getNotificationChannels = (params?: Params, filters?: Filter) =>
  Request<ResourcePage<NotificationChannel>>(
    setURL(
      `http://blr-lhvl2d.bangalore.corp.akamai.com:9001/v4beta/monitor/alert-channels`
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setHeaders({
      Authorization: bearer,
    })
  );

export const editAlertDefinitionEntities = (
  data: EditAlertResourcesPayload,
  serviceType: string,
  alertId: number
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
