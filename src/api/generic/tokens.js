import {
  ReducerGenerator, genActions,
  ONE, MANY, DELETE, POST, PUT,
} from '~/api/internal.ts';

export const config = {
  name: 'tokens',
  primaryKey: 'id',
  endpoint: id => `/profile/tokens/${id}`,
  supports: [ONE, MANY, DELETE, POST, PUT],
};

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
