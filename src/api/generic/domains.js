import {
  addParentRefs, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/internal.ts';

export const config = addParentRefs({
  name: 'domains',
  primaryKey: 'id',
  endpoint: id => `/domains/${id}`,
  supports: [ONE, MANY, POST, PUT, DELETE],
  subresources: {
    _records: {
      name: 'records',
      primaryKey: 'id',
      endpoint: (domain, record) => `/domains/${domain}/records/${record}`,
      supports: [ONE, MANY, PUT, POST, DELETE],
    },
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
