import {
  ReducerGenerator, genActions, ONE, PUT,
} from '~/api/internal.ts';

export const config = {
  name: 'accountsettings',
  primaryKey: 'id',
  endpoint: () => '/account/settings',
  supports: [ONE, PUT],
};

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
