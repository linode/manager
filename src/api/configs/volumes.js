import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, POST, PUT, DELETE,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'volumes',
  endpoint: id => `/linode/volumes/${id}`,
  supports: [ONE, MANY, POST, PUT, DELETE],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
