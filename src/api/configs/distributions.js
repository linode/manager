import {
  genConfig, genReducer, genActions,
  ONE, MANY,
} from '~/api/gen';

export const config = genConfig({
  plural: 'distributions',
  singular: 'distribution',
  endpoint: id => `/linode/distributions/${id}`,
  supports: [ONE, MANY],
});

export const actions = genActions(config);
export const reducer = genReducer(config);
