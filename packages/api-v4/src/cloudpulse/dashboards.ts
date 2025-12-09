import { BETA_API_ROOT as API_ROOT } from 'src/constants';

import Request, { setMethod, setURL } from '../request';

import type { Dashboard } from './types';
import type { ResourcePage } from 'src/types';

// Returns the list of all the dashboards available
export const getDashboards = (serviceType: string) =>
  Request<ResourcePage<Dashboard>>(
    setURL(
      `${API_ROOT}/monitor/services/${encodeURIComponent(
        serviceType,
      )}/dashboards`,
    ),
    setMethod('GET'),
  );

export const getDashboardById = (dashboardId: number) =>
  Request<Dashboard>(
    setURL(`${API_ROOT}/monitor/dashboards/${encodeURIComponent(dashboardId)}`),
    setMethod('GET'),
  );
