import { ResourcePage } from 'src/types';
import Request, { setHeaders, setMethod, setURL } from '../request';
import { Dashboard } from './types';

//Returns the list of all the dashboards available
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