import Request, { setURL, setMethod, setData, setHeaders } from 'src/request';
import { CloudPulseMetricsRequest, CloudPulseMetricsResponse } from './types';

export const getCloudPulseMetricsAPI = (
  jweToken: string,
  readApiEndpoint: string,
  serviceType?: string,
  metricsRequest?: CloudPulseMetricsRequest
) =>
  Request<CloudPulseMetricsResponse>(
    setURL(`${readApiEndpoint}/${encodeURIComponent(serviceType!)}/metrics`),
    setMethod('POST'),
    setData(metricsRequest),
    setHeaders({
      Authorization: `Bearer ${jweToken}`,
    })
  );
