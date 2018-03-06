import {
  ReducerGenerator, genActions, ONE, PUT,
} from '~/api/internal';

export const config = {
  name: 'account',
  primaryKey: 'id',
  endpoint: () => '/account',
  supports: [ONE, PUT],
};

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
