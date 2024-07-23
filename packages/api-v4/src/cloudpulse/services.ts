import { API_ROOT } from 'src/constants';
import Request, { setData, setMethod, setURL } from '../request';
import { JWEToken, JWETokenPayLoad, MetricDefinitions } from './types';
import { ResourcePage as Page } from 'src/types';

export const getMetricDefinitionsByServiceType = (serviceType: string) => {
  return Request<Page<MetricDefinitions>>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType
      )}/metric-definitions`
    ),
    setMethod('GET')
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
