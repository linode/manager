import {
  genConfig, ReducerGenerator, genActions, ONE, MANY,
} from '~/api/internal';

export const config = genConfig({
  plural: 'invoices',
  endpoint: id => `/account/invoices/${id}`,
  supports: [ONE, MANY],
  subresources: {
    _items: {
      plural: 'items',
      primaryKey: 'label',
      endpoint: id => `/account/invoices/${id}/items`,
      supports: [MANY],
    },
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
