import { EventActionKeys } from '@linode/api-v4';

import { eventMessages } from './factory';

/**
 * This test ensures any event message added to our types has a corresponding message in our factory.
 */
describe('eventMessages', () => {
  it('should have a message for each EventAction', () => {
    EventActionKeys.forEach((action) => {
      expect(eventMessages).toHaveProperty(action);
    });
  });
});
