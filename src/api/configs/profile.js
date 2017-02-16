import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, PUT, POST,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'profile',
  singular: 'profile',
  endpoint: () => `/account/profile`,
  supports: [ONE, MANY, PUT, POST],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
