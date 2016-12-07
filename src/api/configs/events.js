import {
  genConfig, ReducerGenerator, genActions, ONE, MANY,
} from '~/api/gen';

export const config = genConfig({
  plural: 'events',
  singular: 'event',
  endpoint: id => `/account/events/${id}`,
  supports: [ONE, MANY],
});

export const actions = genActions(config);
export const { reducer } = new ReducerGenerator(config);
