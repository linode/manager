import { createAlertDefinitionSchema } from '@linode/validation';
import Request, {
  setURL,
  setMethod,
  setData,
  setParams,
  setXFilter,
} from '../request';
import { Alert, AlertServiceType, CreateAlertDefinitionPayload } from './types';
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
  alertId: number
) =>
  Request<Alert>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType
      )}/alert-definitions/${encodeURIComponent(alertId)}`
    ),
    setMethod('GET')
  );
