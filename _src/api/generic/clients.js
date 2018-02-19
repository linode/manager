import {
  ReducerGenerator, genActions,
  ONE, MANY, POST, PUT, DELETE,
} from '~/api/internal';

export const config = {
  name: 'clients',
  primaryKey: 'id',
  endpoint: id => `/account/oauth-clients/${id}`,
  supports: [ONE, MANY, POST, PUT, DELETE],
};

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
