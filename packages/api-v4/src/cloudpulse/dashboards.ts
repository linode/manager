import { ResourcePage } from 'src/types';
import Request, { setMethod, setURL } from '../request';
import { Dashboard } from './types';
import { API_ROOT } from 'src/constants';

// Returns the list of all the dashboards available
export const getDashboards = () =>
  Request<ResourcePage<Dashboard>>(
    setURL(`${API_ROOT}/monitor/services/linode/dashboards`),
    setMethod('GET')
  );

export const getDashboardById = (dashboardId: number) =>
  Request<Dashboard>(
    setURL(`${API_ROOT}/monitor/dashboards/${encodeURIComponent(dashboardId)}`),
    setMethod('GET')
  );
