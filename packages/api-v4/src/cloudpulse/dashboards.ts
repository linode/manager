import { ResourcePage } from 'src/types';
import Request, { setData, setMethod, setURL } from '../request';
import { Dashboard, JWEToken, JWETokenPayLoad } from './types';
import { API_ROOT } from 'src/constants';

//Returns the list of all the dashboards available
export const getDashboards = () =>
  Request<ResourcePage<Dashboard>>(
    setURL(`${API_ROOT}/monitor/services/linode/dashboards`),
    setMethod('GET')
  );

  export const getDashboardById = (dashboardId?: number) =>
    Request<Dashboard>(
      setURL(
        `${API_ROOT}/monitor/dashboards/${encodeURIComponent(dashboardId!)}`
      ),
      setMethod('GET')
    );

  export const getJWEToken = (data: JWETokenPayLoad, serviceType: string) =>
    Request<JWEToken>(
      setURL(
        `${API_ROOT}/monitor/services/${encodeURIComponent(
          serviceType
        )}/token`
      ),
      setMethod('POST'),
      setData(data)
    );
