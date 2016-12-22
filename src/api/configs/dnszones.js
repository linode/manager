import {
  genConfig, ReducerGenerator, genActions,
  ONE, MANY, PUT, DELETE, POST,
} from '~/api/gen';

export const config = genConfig({
  plural: 'dnszones',
  singular: 'dnszone',
  endpoint: id => `/dns/zones/${id}`,
  supports: [ONE, MANY, PUT, DELETE, POST],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
