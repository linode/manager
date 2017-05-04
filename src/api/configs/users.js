import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, DELETE, PUT, POST,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'users',
  primaryKey: 'username',
  endpoint: user => `/account/users/${user}`,
  supports: [ONE, MANY, DELETE, PUT, POST],
  subresources: {
    _permissions: {
      singular: 'permissions',
      endpoint: user => `/account/users/${user}/grants`,
      supports: [ONE, PUT],
    },
    _password: {
      singular: 'password',
      endpoint: user => `/account/users/${user}/password`,
      supports: [POST],
    },
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
