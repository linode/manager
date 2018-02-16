import { ONE, MANY, DELETE } from '~/api/internal.ts';

import { configsNodeBalancer, noGroupNodeBalancer } from '~/data/nodebalancers';

export const resource = { ...configsNodeBalancer };
export const page = {
  data: [configsNodeBalancer, noGroupNodeBalancer],
  pages: 1,
  results: 1,
  page: 1,
  nodebalancers: [configsNodeBalancer, noGroupNodeBalancer],
};

export const testConfigOne = {
  name: 'nodebalancers',
  primaryKey: 'id',
  endpoint: id => `/nodebalancers/${id}`,
  supports: [ONE],
};

export const testConfigMany = {
  name: 'nodebalancers',
  primaryKey: 'id',
  endpoint: id => `/nodebalancers/${id}`,
  supports: [MANY],
};

export const testConfigDelete = {
  name: 'nodebalancers',
  primaryKey: 'id',
  endpoint: id => `/nodebalancers/${id}`,
  supports: [DELETE],
};
