import {
  addParentRefs, ReducerGenerator, genActions,
  ONE, MANY, DELETE, PUT, POST,
} from '~/api/internal';

export const config = addParentRefs({
  name: 'users',
  primaryKey: 'username',
  endpoint: user => `/account/users/${user}`,
  supports: [ONE, MANY, DELETE, PUT, POST],
  subresources: {
    _permissions: {
      name: 'permissions',
      primaryKey: 'id',
      endpoint: user => `/account/users/${user}/grants`,
      supports: [ONE, PUT],
    },
    _password: {
      name: 'password',
      primaryKey: 'id',
      endpoint: user => `/account/users/${user}/password`,
      supports: [POST],
    },
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
