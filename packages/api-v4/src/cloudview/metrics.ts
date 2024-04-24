import { CLOUDVIEW_METRICS_ROOT } from '../constants';
import Request, { setData, setHeaders, setMethod, setURL } from '../request';
import { CloudViewMetricsRequest, CloudViewMetricsResponse } from './types';

export const getCloudViewMetrics = (
  jweToken: string,
  serviceType?: string,
  metricsRequest?: CloudViewMetricsRequest
) =>
  Request<CloudViewMetricsResponse>(
    setURL(
      `${CLOUDVIEW_METRICS_ROOT}/monitor/service/${encodeURIComponent(
        serviceType!
      )}/metrics`
    ),
    setMethod('POST'),
    setData(metricsRequest),
    setHeaders({
      Authorization: `Bearer ${jweToken}`,
    })
  );

export const getCloudViewMetricsAPI = (
  jweToken: string,
  serviceType?: string,
  metricsRequest?: CloudViewMetricsRequest
) =>
  Request<CloudViewMetricsResponse>(
    setURL(
      `https://aclp-us-iad.cloud-observability-dev.akadns.net/monitor/service/${encodeURIComponent(
        serviceType!
      )}/metrics`
    ),
    setMethod('POST'),
    setData(metricsRequest),
    setHeaders({
      Authorization: 'Bearer ' + jweToken,
    })
  );
