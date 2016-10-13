import {
  genConfig, genReducer, genActions,
  ONE, MANY,
} from '~/api/gen';

export const config = genConfig({
  plural: 'kernels',
  singular: 'kernel',
  endpoint: id => `/linode/kernels/${id}`,
  supports: [ONE, MANY],
});

export const actions = genActions(config);
export const reducer = genReducer(config);
