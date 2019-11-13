import { Event } from 'linode-js-sdk/lib/account';
import { entityFactory, eventFactory } from 'src/factories/events';
import getEventMessage, {
  eventMessageCreators,
  safeSecondaryEntityLabel
} from './eventMessageGenerator';

describe('Event message generation', () => {
  describe('getEventMessage', () => {
    it('should filter unknown events', () => {
      const mockEvent = {
        action: '__unknown__',
        status: 'started'
      };
      const result = getEventMessage(mockEvent as Event);

      expect(result).toBe('__unknown__');
    });

    it('should filter mangled events', () => {
      const mockEvent = {
        action: 'linode_reboot',
        status: 'scheduled',
        entity: null
      };
      const result = getEventMessage(mockEvent as Event);

      expect(result).toBe('');
    });

    it('should call the message generator with the event', () => {
      const mockEvent = {
        action: 'linode_reboot',
        status: 'scheduled',
        entity: { label: 'test-linode-123' }
      };

      /** Mock the message creator */
      eventMessageCreators.linode_reboot.scheduled = jest.fn();

      /** Invoke the function. */
      getEventMessage(mockEvent as Event);

      /** Check that the mocked creator was called w/ the mock event. */
      expect(eventMessageCreators.linode_reboot.scheduled).toHaveBeenCalledWith(
        mockEvent
      );
    });
  });

  describe('safeSecondaryEventLabel', () => {
    it('should return a correct message if the secondary entity is present', () => {
      const mockEventWithSecondaryEntity = eventFactory.build({
        secondary_entity: entityFactory.build({ label: 'secondary-entity' })
      });
      expect(
        safeSecondaryEntityLabel(
          mockEventWithSecondaryEntity,
          'booted with',
          'booted'
        )
      ).toMatch('booted with secondary-entity');
    });

    it('should return a safe default if the secondary entity is null', () => {
      const mockEventWithoutSecondaryEntity = eventFactory.build();
      expect(
        safeSecondaryEntityLabel(
          mockEventWithoutSecondaryEntity,
          'booted with',
          'booted'
        )
      ).toMatch('booted');
      expect(
        safeSecondaryEntityLabel(
          mockEventWithoutSecondaryEntity,
          'booted with',
          'booted'
        )
      ).not.toMatch('booted with');
    });
  });
});
