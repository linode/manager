import {
  genConfig, ReducerGenerator, genActions, ONE, MANY,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  singular: 'invoices',
  endpoint: id => `/account/invoices/${id}`,
  supports: [ONE, MANY],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);

