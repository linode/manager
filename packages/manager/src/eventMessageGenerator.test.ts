import { Event } from '@linode/api-v4/lib/account';
import { entityFactory, eventFactory } from 'src/factories/events';
import getEventMessage, {
  eventMessageCreators,
  safeSecondaryEntityLabel,
} from './eventMessageGenerator';
import { applyLinking } from './eventMessageGenerator';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('Event message generation', () => {
  describe('getEventMessage', () => {
    it('should filter unknown events', () => {
      const mockEvent = {
        action: '__unknown__',
        status: 'started',
      };
      const result = getEventMessage(mockEvent as Event);

      expect(result).toBe('__unknown__');
    });

    it('should filter mangled events', () => {
      const mockEvent = {
        action: 'linode_reboot',
        status: 'scheduled',
        entity: null,
      };
      const result = getEventMessage(mockEvent as Event);

      expect(result).toBe('');
    });

    it('should call the message generator with the event', () => {
      const mockEvent = {
        action: 'linode_reboot',
        status: 'scheduled',
        entity: { label: 'test-linode-123' },
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
        secondary_entity: entityFactory.build({ label: 'secondary-entity' }),
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
      const mockEventWithoutSecondaryEntity = eventFactory.build({
        secondary_entity: null,
      });
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

  describe('apply linking to labels', () => {
    it('should return empty string if message is falsy', () => {
      const mockEvent = {
        action: 'create',
        entity: null,
        secondary_entity: null,
      };
      const message = null;
      const result = applyLinking(mockEvent as Event, message as any);

      expect(result).toEqual('');
    });

    it('should replace entity label with link if entity and link exist', () => {
      const entity = { id: '123', label: 'foo', type: 'linode' };
      const mockEvent = { action: 'create', entity, secondary_entity: null };
      const message = 'created entity foo';
      const link = '/linodes/123';
      const result = applyLinking(mockEvent as any, message);

      expect(result).toEqual(`created entity <a href="${link}">foo</a> `);
    });

    it('should replace secondary entity label with link if entity and link exist', () => {
      jest.clearAllMocks();

      const entity = { id: '123', label: 'foo', type: 'linode' };
      const secondary_entity = { id: '456', label: 'bar' };
      const mockEvent = { action: 'create', entity, secondary_entity };
      const message = 'created secondary_entity for foo';
      const link = '/linodes/123';
      const result = applyLinking(mockEvent as any, message);

      expect(result).toEqual(
        `created secondary_entity for <a href="${link}">foo</a> `
      );
    });

    it('should not replace entity label if label is inside backticks', () => {
      const entity = { id: '123', label: 'foo' };
      const mockEvent = { action: 'create', entity, secondary_entity: null };
      const message = 'created `foo`';
      const result = applyLinking(mockEvent as any, message);

      expect(result).toEqual('created `foo`');
    });
  });
});
