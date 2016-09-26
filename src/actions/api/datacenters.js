import { makeFetchPage, makeFetchAll } from '~/api/store';

export const UPDATE_DATACENTER = '@@datacenters/UPDATE_DATACENTERS';
export const UPDATE_DATACENTERS = '@@datacenters/UPDATE_DATACENTERS';

export const datacenterConfig = {
  singular: 'datacenter',
  plural: 'datacenters',
  endpoint: id => `/datacenters/${id}`,
  actions: {
    update_single: UPDATE_DATACENTER,
    updateItems: UPDATE_DATACENTERS,
  },
};

export const fetchDatacenters = makeFetchPage(datacenterConfig);
export const fetchAllDatacenters = makeFetchAll(datacenterConfig, fetchDatacenters);
