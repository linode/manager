import {
  genConfig, ReducerGenerator, genActions, ONE,
} from '~/api/internal';

export const config = genConfig({
  singular: 'banners',
  endpoint: () => '/account/notifications',
  supports: [ONE],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
