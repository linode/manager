import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, DELETE,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'users',
  singular: 'user',
  endpoint: id => `/account/users/${id}`,
  supports: [ONE, MANY, DELETE],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
