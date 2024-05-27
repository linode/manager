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
      `https://metrics-query.aclp.linode.com/monitor/services/${encodeURIComponent(
        serviceType!
      )}/metrics`
    ),
    setMethod('POST'),
    setData(metricsRequest),
    setHeaders({
      Authorization: "eyJhbGciOiAiZGlyIiwgImVuYyI6ICJBMTI4Q0JDLUhTMjU2IiwgImtpZCI6IDEsICJleHAiOiAxODEzOTgxMTI1fQ..cMTxfbDy5Lw1V3wP5VXLCg.ygeoTkiqfOIkhfM5Z4bB7TmOVnvM_R7JbleQhUYCv-VhQzLNfMUN-kxQv0T2lSQ7jZgMHAzfhRWUGJKXX4QUlN_x3jQBJ9pl2qvgXlCKdrrQL2tblZ24qEu1i3bwjnGzYXk6JxE4RyCyKyJXfyrbH_zEcjPJyVrnrD9vSEwuxFKZZySH4GycCO9D-BlPIztdhNVVR6I_qTXU6Mei0rdqFvQNjLTxkqgbat-gJf0zV7GDoFAZRFIOiPxedgzQfR3GKJef-IRUsPUqU301gfzbqYpPohNeYRgICVdjiuCQbAac2UcwLOGhNm_7KS-8HPS7Sbug2e6-0siJHqJegu34cmXkEo6xhGqGxNiAGpvLzDp3DqNhVsi0_65pEDxXZ556qOLQjO8OWO7JmYcuwHCnIvgLXlms_SU-DEHvGBais18IxwNP2IOZpsBuvyQFTZxtmVadaNfynbtOeNdBxuySfA.WV6JpbtWLf_ztQHgLaRTAQ",
      'Authentication-type' : "jwe"
    })
  );
