import {
  addParentRefs, ReducerGenerator, genActions, ONE, MANY, POST,
} from '~/api/internal.ts';

export const config = addParentRefs({
  name: 'tickets',
  primaryKey: 'id',
  endpoint: id => `/support/tickets/${id}`,
  supports: [ONE, MANY, POST],
  subresources: {
    _replies: {
      name: 'replies',
      primaryKey: 'id',
      endpoint: (ticket, reply) => `/support/tickets/${ticket}/replies/${reply}`,
      supports: [ONE, MANY, POST],
    },
  },
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
