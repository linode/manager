import {
  ReducerGenerator, genActions,
  ONE, MANY,
} from '~/api/internal';

export const config = {
  name: 'regions',
  primaryKey: 'id',
  endpoint: id => `/regions/${id}`,
  supports: [ONE, MANY],
};

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
