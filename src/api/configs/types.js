import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'types',
  endpoint: id => `/linode/types/${id}`,
  cache: true,
  supports: [ONE, MANY],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
