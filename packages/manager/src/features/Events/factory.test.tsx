import { EventActionSchema } from '@akamai/compute-ui-core/events';

import { eventMessages } from './factory';

/**
 * This test ensures any event message added to our types has a corresponding message in our factory.
 */
describe('eventMessages', () => {
  it('should have a message for each EventAction', () => {
    EventActionSchema.options.forEach((action) => {
      expect(Object.keys(eventMessages)).toContain(action);
    });
  });
});
