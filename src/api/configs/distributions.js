import {
<<<<<<< HEAD
  genConfig, genReducer, genActions,
=======
  genConfig, genThunks, genReducer, genActions,
>>>>>>> a4d16bb... Fix eslint after eslint update
  ONE, MANY,
} from '~/api/gen';

export const config = genConfig({
  plural: 'distributions',
  singular: 'distribution',
  endpoint: id => `/linode/distributions/${id}`,
  supports: [ONE, MANY],
});

export const actions = genActions(config);
export const reducer = genReducer(config);
