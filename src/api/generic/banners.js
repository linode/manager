import {
  ReducerGenerator, genActions, ONE,
} from '~/api/internal';

export const config = {
  name: 'banners',
  primaryKey: 'id',
  endpoint: () => '/account/notifications',
  supports: [ONE],
};

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
