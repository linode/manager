import { API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { MetricDefinitions, MonitorServiceType, ServiceTypes } from './types';
import { ResourcePage as Page } from 'src/types';

/**
 * getCloudViewServiceTypes
 *
 * Returns list of CloudView Service Types with details.
 *
 */
export const getCloudViewServiceTypes = () =>
  Request<ServiceTypes>(
    setURL(`${API_ROOT}/cloudview/services`),
    setMethod('GET')
  );

export const getMonitorServiceTypeInformationByServiceType = (
  serviceType: string
) =>
  Request<MonitorServiceType>(
    setURL(`${API_ROOT}/monitor/services/${serviceType}`),
    setMethod('GET')
  );

export const getMetricDefinitionsByServiceType = (serviceType: string) =>
  Request<Page<MetricDefinitions>>(
    setURL(`${API_ROOT}/monitor/services/${serviceType}/metricDefinitions`),
    setMethod('GET')
  );
