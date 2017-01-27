import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'kernels',
  singular: 'kernel',
  endpoint: id => `/linode/kernels/${id}`,
  supports: [ONE, MANY],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
