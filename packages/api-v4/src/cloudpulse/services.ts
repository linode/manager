import { BETA_API_ROOT as API_ROOT } from 'src/constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';
import {
  JWEToken,
  JWETokenPayLoad,
  MetricDefinition,
  ServiceTypesList,
} from './types';
import { Filter, Params, ResourcePage } from 'src/types';

export const getMetricDefinitionsByServiceType = (
  serviceType: string,
  params?: Params,
  filters?: Filter
) => {
  return Request<ResourcePage<MetricDefinition>>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType
      )}/metric-definitions`
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  );
};

export const getJWEToken = (data: JWETokenPayLoad, serviceType: string) =>
  Request<JWEToken>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(serviceType)}/token`
    ),
    setMethod('POST'),
    setData(data)
  );

// Returns the list of service types available
export const getCloudPulseServiceTypes = () =>
  Request<ServiceTypesList>(
    setURL(`${API_ROOT}/monitor/services`),
    setMethod('GET')
  );
