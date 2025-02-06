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
  EditAlertDefinitionPayload,
  NotificationChannel,
} from './types';
import { BETA_API_ROOT as API_ROOT } from '../constants';
import { Params, Filter, ResourcePage } from '../types';

const bearer = 'Bearer vagrant';

const hostedDomain = `http://blr-lhvl2d.bangalore.corp.akamai.com:9001/v4beta`;
export const createAlertDefinition = (
  data: CreateAlertDefinitionPayload,
  serviceType: AlertServiceType
) =>
  Request<Alert>(
    setURL(
      `${hostedDomain}/monitor/services/${encodeURIComponent(
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
    setURL(`${hostedDomain}/monitor/alert-definitions`),
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
      `${hostedDomain}/monitor/services/${encodeURIComponent(
        // updating only here as this is the only API ready
        serviceType
      )}/alert-definitions/${encodeURIComponent(alertId)}`
    ),
    setMethod('GET'),
    setHeaders({
      Authorization: bearer,
    })
  );

export const getNotificationChannels = (params?: Params, filters?: Filter) =>
  Request<ResourcePage<NotificationChannel>>(
    setURL(`${hostedDomain}/monitor/alert-channels`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
    setHeaders({
      Authorization: bearer,
    })
  );

export const editAlertDefinition = (
  data: EditAlertDefinitionPayload,
  serviceType: string,
  alertId: number
) =>
  Request<Alert>(
    setURL(
      `${hostedDomain}/monitor/services/${encodeURIComponent(
        serviceType
      )}/alert-definitions/${encodeURIComponent(alertId)}`
    ),
    setMethod('PUT'),
    setData(data)
  );
