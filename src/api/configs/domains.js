import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'domains',
  singular: 'domain',
  endpoint: id => `/domains/${id}`,
  supports: [ONE, MANY, POST, PUT, DELETE],
  subresources: {
    _records: {
      plural: 'records',
      singular: 'record',
      endpoint: (domain, record) => `/domains/${domain}/records/${record}`,
      supports: [ONE, MANY, PUT, POST, DELETE],
    },
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
