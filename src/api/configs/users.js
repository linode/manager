import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, DELETE, PUT, POST,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'users',
  singular: 'user',
  primaryKey: 'username',
  endpoint: id => `/account/users/${id}`,
  supports: [ONE, MANY, DELETE, PUT, POST],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
