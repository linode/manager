import {
  ReducerGenerator, genActions, ONE, PUT,
} from '~/api/internal.ts';

export const config = {
  name: 'profile',
  primaryKey: 'id',
  endpoint: () => '/profile',
  supports: [ONE, PUT],
};

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
