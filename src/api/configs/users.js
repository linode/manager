import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, DELETE, PUT, POST,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'users',
  singular: 'user',
  primaryKey: 'username',
  endpoint: user => `/account/users/${user}`,
  supports: [ONE, MANY, DELETE, PUT, POST],
  subresources: {
    _permissions: {
      plural: 'permissions',
      singular: 'permissions',
      endpoint: user => `/account/users/${user}/grants`,
      supports: [ONE, MANY, PUT],
    },
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
