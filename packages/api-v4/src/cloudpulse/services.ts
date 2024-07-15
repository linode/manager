// import { API_ROOT } from '../constants';
import { API_ROOT } from 'src/constants';
import Request, { setMethod, setURL } from '../request';
import {
  MetricDefinitions,
} from './types';
import { ResourcePage as Page } from 'src/types';


export const getMetricDefinitionsByServiceType = (serviceType: string) => {
  return Request<Page<MetricDefinitions>>(
    setURL(`${API_ROOT}/monitor/services/${serviceType}/metricDefinitions`),
    setMethod('GET'),
  );
};
