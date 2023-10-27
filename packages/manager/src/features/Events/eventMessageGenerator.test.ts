import { Event } from '@linode/api-v4/lib/account';

import { entityFactory, eventFactory } from 'src/factories/events';

import { applyLinking } from './eventMessageGenerator';
import {
  eventMessageCreators,
  generateEventMessage,
  safeSecondaryEntityLabel,
} from './eventMessageGenerator';

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
      const result = generateEventMessage(mockEvent as Event);

      expect(result).toBe('__unknown__');
    });

    it('should filter mangled events', () => {
      const mockEvent = {
        action: 'linode_reboot',
        entity: null,
        status: 'scheduled',
      };
      const result = generateEventMessage(mockEvent as Event);

      expect(result).toBe('');
    });

    it('should call the message generator with the event', () => {
      const mockEvent = {
        action: 'linode_reboot',
        entity: { label: 'test-linode-123' },
        status: 'scheduled',
      };

      /** Mock the message creator */
      eventMessageCreators.linode_reboot.scheduled = jest.fn();

      /** Invoke the function. */
      generateEventMessage(mockEvent as Event);

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
    const entity = entityFactory.build({ id: 10, label: 'foo' });

    it('should return empty string if message is falsy', () => {
      const mockEvent = eventFactory.build({ action: 'domain_record_create' });
      const message = null;
      const result = applyLinking(mockEvent, message as any); // casting since message is a required prop

      expect(result).toEqual('');
    });

    it('should replace entity label with link if entity and link exist', async () => {
      const mockEvent = eventFactory.build({ entity });
      const message = 'created entity foo';
      const result = applyLinking(mockEvent, message);

      expect(result).toEqual(`created entity <a href="/linodes/10">foo</a> `);
    });

    it('should replace secondary entity label with link if entity and link exist', () => {
      const mockEvent = eventFactory.build({ entity });
      const message = 'created secondary_entity for foo';
      const result = applyLinking(mockEvent, message);

      expect(result).toEqual(
        `created secondary_entity for <a href="/linodes/10">foo</a> `
      );
    });

    it('should not replace entity label if label is inside backticks', () => {
      const mockEvent1 = eventFactory.build({ entity });
      const message1 = 'created `foo`';
      const result1 = applyLinking(mockEvent1, message1);

      expect(result1).toEqual('created `foo`');

      // In this case we also should not replace the label
      // This tests the regex strength of the function so
      // so "something.com" does not return a match for "mail.something.com"
      const mockEvent2 = eventFactory.build(
        entityFactory.build({ id: 10, label: 'something.com' })
      );
      const message2 = 'created `mail.something.com`';
      const result2 = applyLinking(mockEvent2, message2);

      expect(result2).toEqual('created `mail.something.com`');
    });

    it('should escape regex special characters', () => {
      const mockEvent = eventFactory.build({
        entity: entityFactory.build({
          id: 10,
          label: 'Weird label with special characters.(?)',
        }),
      });
      const message = 'created entity Weird label with special characters.(?)';
      const result = applyLinking(mockEvent, message);

      // eslint-disable-next-line xss/no-mixed-html
      expect(result).toEqual(
        'created entity <a href="/linodes/10">Weird label with special characters.(?)</a> '
      );
    });

    it('should work when label is null', () => {
      const mockEvent = eventFactory.build({
        entity: entityFactory.build({
          id: 10,
          label: null,
        }),
      });
      const message = 'created entity Null label';
      const result = applyLinking(mockEvent, message);

      expect(result).toEqual('created entity Null label');
    });
  });
});
