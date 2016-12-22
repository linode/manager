import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY,
} from '~/api/gen';

export const config = genConfig({
  plural: 'types',
  singular: 'type',
  endpoint: id => `/linode/types/${id}`,
  supports: [ONE, MANY],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
