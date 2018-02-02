import {
  addParentRefs, ReducerGenerator, genActions, ONE, MANY,
} from '~/api/internal.ts';

export const config = addParentRefs({
  name: 'invoices',
  primaryKey: 'id',
  endpoint: id => `/account/invoices/${id}`,
  supports: [ONE, MANY],
  subresources: {
    _items: {
      name: 'items',
      primaryKey: 'label',
      endpoint: id => `/account/invoices/${id}/items`,
      supports: [MANY],
    },
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
