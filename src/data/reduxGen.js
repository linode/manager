import { ONE, MANY, DELETE } from '~/api/internal';

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
  singular: 'nodebalancers',
  primaryKey: 'id',
  endpoint: id => `/nodebalancers/${id}`,
  supports: [ONE],
};

export const testConfigMany = {
  plural: 'nodebalancers',
  primaryKey: 'id',
  endpoint: id => `/nodebalancers/${id}`,
  supports: [MANY],
};

export const testConfigDelete = {
  singular: 'nodebalancers',
  primaryKey: 'id',
  endpoint: id => `/nodebalancers/${id}`,
  supports: [DELETE],
};
