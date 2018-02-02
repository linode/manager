import {
  ReducerGenerator, genActions,
  ONE, MANY, POST, PUT, DELETE,
} from '~/api/internal.ts';

export const config = {
  name: 'images',
  primaryKey: 'id',
  endpoint: id => `/images/${id}`,
  supports: [ONE, MANY, POST, PUT, DELETE],
};

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
