import {
  genConfig, ReducerGenerator, genActions, ONE, MANY, POST,
} from '~/api/apiResultActionReducerGenerator';

export const config = genConfig({
  plural: 'tickets',
  singular: 'tickets',
  endpoint: id => `/support/tickets/${id}`,
  supports: [ONE, MANY, POST],
  subresources: {
    _replies: {
      plural: 'replies',
      singular: 'reply',
      endpoint: (ticket, reply) => `/support/tickets/${ticket}/replies/${reply}`,
      supports: [ONE, MANY, POST],
    },
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
