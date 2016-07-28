import { makeFetchPage, makeFetchAll } from '~/api-store';

export const UPDATE_DATACENTERS = '@@datacenters/UPDATE_DATACENTERS';

export const fetchDatacenters = makeFetchPage(
    UPDATE_DATACENTERS, 'datacenters');

export const fetchAllDatacenters = makeFetchAll(
    fetchDatacenters, 'datacenters');
