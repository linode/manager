// import { BETA_API_ROOT as API_ROOT } from 'src/constants';
import Request, { setData, setHeaders, setMethod, setURL } from '../request';
import {
  JWEToken,
  JWETokenPayLoad,
  MetricDefinitions,
  ServiceTypesList,
} from './types';
import { ResourcePage as Page } from 'src/types';


const API_ROOT = 'https://blr-lhvm1i.bangalore.corp.akamai.com:9000/v4beta';

export const getMetricDefinitionsByServiceType = (serviceType: string) => {
  return Request<Page<MetricDefinitions>>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType
      )}/metric-definitions`
    ),
    setMethod('GET'),
    setHeaders({
      Authorization: 'Bearer vagrant'
    })
  );
};

export const getJWEToken = (data: JWETokenPayLoad, serviceType: string) =>
  Request<JWEToken>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(serviceType)}/token`
    ),
    setMethod('POST'),
    setData(data),
    setHeaders({
      Authorization: 'Bearer mlishuser'
    })
  );

// Returns the list of service types available
export const getCloudPulseServiceTypes = () =>
  Request<ServiceTypesList>(
    setURL(`${API_ROOT}/monitor/services`),
    setMethod('GET'),
    setHeaders({
      Authorization: 'Bearer vagrant'
    })
  );
