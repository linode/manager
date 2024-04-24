import { ResourcePage } from 'src/types';
import { API_ROOT } from '../constants';

import Request, { setMethod, setURL, setData, setHeaders } from '../request';
import { Dashboard, JWEToken, GetJWETokenPayload } from './types';

export const getDashboardById = (dashboardId?: number) =>
  Request<Dashboard>(
    setURL(
      `${API_ROOT}/monitor/dashboards/${encodeURIComponent(dashboardId!)}`
    ),
    setMethod('GET')
  );

export const getDashboards = () =>
  Request<ResourcePage<Dashboard>>(
    setURL(
      `http://blr-lhv95n.bangalore.corp.akamai.com:9000/v4/monitor/services/linode/dashboards`
    ),
    setMethod('GET'),
    setHeaders({
      Authorization: 'Bearer vagrant',
    })
  );

export const getJWEToken = (data: GetJWETokenPayload, serviceType: string) =>
  Request<JWEToken>(
    setURL(
      `http://blr-lhv95n.bangalore.corp.akamai.com:9000/v4/monitor/service/${encodeURIComponent(
        serviceType
      )}/token`
    ),
    setMethod('POST'),
    setData(data),
    setHeaders({
      Authorization: `Bearer mlishuser`,
    })
  );
