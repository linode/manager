import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'nodebalancers',
  singular: 'nodebalancers',
  endpoint: id => `/nodebalancers/${id}`,
  supports: [ONE, MANY, PUT, DELETE, POST],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
