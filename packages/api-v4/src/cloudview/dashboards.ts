import { API_ROOT } from '../constants';
import Request, {
    setMethod,    
    setURL,    
  } from '../request';
import { Dashboard } from './types';

export const getDashboardById = (
    dashboardId?:number) =>       

  Request<Dashboard>(
    setURL(`${API_ROOT}/cloudview/dashboards/${encodeURIComponent(dashboardId!)}`),
    setMethod('GET')    
  );