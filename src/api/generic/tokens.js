import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, DELETE, POST, PUT,
} from '~/api/internal';

export const config = genConfig({
  plural: 'tokens',
  endpoint: id => `/profile/tokens/${id}`,
  supports: [ONE, MANY, DELETE, POST, PUT],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
