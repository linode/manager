import { BETA_API_ROOT as API_ROOT } from 'src/constants';
import Request, { setData, setHeaders, setMethod, setURL } from '../request';
import {
  JWEToken,
  JWETokenPayLoad,
  MetricDefinition,
  ServiceTypesList,
} from './types';
import { Filter, Params, ResourcePage } from 'src/types';

const bearer = 'Bearer vagrant';

export const getMetricDefinitionsByServiceType = (
  serviceType: string,
  params?: Params,
  filters?: Filter
) => {
  return Request<ResourcePage<MetricDefinition>>(
    setURL(
      `http://blr-lhvl2d.bangalore.corp.akamai.com:9001/v4beta/monitor/services/${encodeURIComponent(
        serviceType
      )}/metric-definitions`
    ),
    setMethod('GET'),
    setHeaders({
      Authorization: bearer,
    })
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
    setURL(
      `http://blr-lhvl2d.bangalore.corp.akamai.com:9001/v4beta/monitor/services`
    ),
    setMethod('GET'),
    setHeaders({
      Authorization: bearer,
    })
  );
