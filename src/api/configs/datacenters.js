import {
  genConfig, genReducer, genActions,
  ONE, MANY,
} from '~/api/gen';

export const config = genConfig({
  plural: 'datacenters',
  singular: 'datacenter',
  localStorageCacheable: true,
  endpoint: id => `/datacenters/${id}`,
  supports: [ONE, MANY],
});

export const actions = genActions(config);
export const reducer = genReducer(config);
