import {
<<<<<<< HEAD
  genConfig, genReducer, genActions,
=======
  genConfig, genThunks, genReducer, genActions,
>>>>>>> a4d16bb... Fix eslint after eslint update
  ONE, MANY,
} from '~/api/gen';

export const config = genConfig({
  plural: 'types',
  singular: 'type',
  endpoint: id => `/linode/types/${id}`,
  supports: [ONE, MANY],
});

export const actions = genActions(config);
export const reducer = genReducer(config);
