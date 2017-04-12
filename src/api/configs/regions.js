import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'regions',
  singular: 'region',
  endpoint: id => `/regions/${id}`,
  supports: [ONE, MANY],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
