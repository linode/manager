import { CLOUDVIEW_METRICS_ROOT } from '../constants';
import Request, {
    setData,
    setMethod,    
    setURL,    
  } from '../request';
import { CloudViewMetricsRequest, CloudViewMetricsResponse } from './types';

export const getCloudViewMetrics = (
    serviceType?:string, metricsRequest?:CloudViewMetricsRequest) =>       

  Request<CloudViewMetricsResponse>(
    setURL(`${CLOUDVIEW_METRICS_ROOT}/aclp/service/${encodeURIComponent(serviceType!)}/metrics`),
    setMethod('POST'),
    setData(metricsRequest)
  );