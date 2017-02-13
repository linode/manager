import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'dnszones',
  singular: 'dnszone',
  endpoint: id => `/dns/zones/${id}`,
  supports: [ONE, MANY, POST, DELETE],
  subresources: {
    _records: {
      plural: 'records',
      singular: 'record',
      endpoint: (dnszone, record) => `/dns/zones/${dnszone}/records/${record}`,
      supports: [ONE, MANY, PUT, DELETE],
    },
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
