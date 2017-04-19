import {
  genConfig, ReducerGenerator, genActions, ONE, PUT,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'profile',
  singular: 'profile',
  endpoint: () => '/account/profile',
  supports: [ONE, PUT],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
