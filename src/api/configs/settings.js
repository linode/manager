import {
  genConfig, ReducerGenerator, genActions, ONE, PUT,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'settings',
  singular: 'setting',
  endpoint: () => '/account/settings',
  supports: [ONE, PUT],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
