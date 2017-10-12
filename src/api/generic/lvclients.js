import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/internal';

export const config = genConfig({
  plural: 'lvclients',
  endpoint: id => `/longview/clients/${id}`,
  supports: [ONE, MANY, PUT, DELETE, POST],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
