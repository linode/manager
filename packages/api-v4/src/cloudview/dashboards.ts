import { ResourcePage } from 'src/types';
import { API_ROOT } from '../constants';
import Request, { setMethod, setURL } from '../request';
import { Dashboard } from './types';

export const getDashboardById = (dashboardId?: number) =>
  Request<Dashboard>(
    setURL(
      `${API_ROOT}/monitor/dashboards/${encodeURIComponent(dashboardId!)}`
    ),
    setMethod('GET')
  );

export const getDashboards = () =>
  Request<ResourcePage<Dashboard>>(
    setURL(`${API_ROOT}/monitor/dashboards`),
    setMethod('GET')
  );
