import { ResourcePage } from 'src/types';
import Request, { setHeaders, setMethod, setURL } from '../request';
import { Dashboard } from './types';
import { API_ROOT } from 'src/constants';

//Returns the list of all the dashboards available
export const getDashboards = () =>
    Request<ResourcePage<Dashboard>>(
        setURL(
            `${API_ROOT}/monitor/services/linode/dashboards`
        ),
        setMethod('GET'),
        setHeaders({
            Authorization: '',  //Authorization will be updated once the end-point is ready, till then will use mock data
        })
    );