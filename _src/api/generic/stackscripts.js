import {
  ReducerGenerator, genActions,
  ONE, MANY, POST, PUT, DELETE,
} from '~/api/internal';

export const config = {
  name: 'stackscripts',
  primaryKey: 'id',
  endpoint: id => `/linode/stackscripts/${id}`,
  supports: [ONE, MANY, POST, PUT, DELETE],
};

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
