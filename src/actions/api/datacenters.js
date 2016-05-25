import { makeFetchPage } from '~/api-store';

export const UPDATE_DATACENTERS = '@@datacenters/UPDATE_DATACENTERS';

export const fetchDatacenters = makeFetchPage(
    UPDATE_DATACENTERS, 'datacenters');
