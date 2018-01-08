import {
  ReducerGenerator, genActions,
  ONE, MANY,
} from '~/api/internal';

export const config = {
  name: 'types',
  primaryKey: 'id',
  endpoint: id => `/linode/types/${id}`,
  supports: [ONE, MANY],
};

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
