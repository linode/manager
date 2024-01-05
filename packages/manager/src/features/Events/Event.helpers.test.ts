import { eventFactory } from 'src/factories/events';

import {
  formatEventWithAppendedText,
  formatEventWithUsername,
  maybeRemoveTrailingPeriod,
} from './Event.helpers';

import type { EventAction } from '@linode/api-v4';

describe('Utility Functions', () => {
  describe('formatEventWithUsername utility', () => {
    it('it should return a message for an event without a username unchanged', () => {
      const message = 'a message';
      expect(
        formatEventWithUsername('linode_boot' as EventAction, null, message)
      ).toEqual(message);
    });

    it('should append the username to a normal event', () => {
      const message = 'a message';
      expect(
        formatEventWithUsername(
          'linode_boot' as EventAction,
          'test-user-001',
          message
        )
      ).toEqual('a message by **test-user-001**.');
    });

    it('should append the username to a normal event', () => {
      const message = 'a message';
      expect(
        formatEventWithUsername(
          'lassie_reboot' as EventAction,
          'test-user-001',
          message
        )
      ).toEqual(message);
    });

    it('should not reappend a username to any event already containing one', () => {
      const message = 'a message by **test-user-001**';
      expect(
        formatEventWithUsername(
          'resize_disk' as EventAction,
          'test-user-001',
          message
        )
      ).toEqual(message);
    });
  });

  describe('formatEventWithAppendedText utility', () => {
    it('should append text to the end of an existing event message', () => {
      const message = 'a message by **test-user-001**.';
      const appendedText = 'Text to append.';
      const mockEvent = eventFactory.build({
        username: 'test-user-001',
      });

      expect(
        formatEventWithAppendedText(mockEvent, message, appendedText)
      ).toEqual(`${message} ${appendedText}`);
    });

    it('should append hyperlinked text to the end of an existing event message', () => {
      const message = 'a message.';
      const appendedText = 'Link to append.';
      const link = 'https://cloud.linode.com';
      const mockEvent = eventFactory.build({
        username: null,
      });

      expect(
        formatEventWithAppendedText(mockEvent, message, appendedText, link)
      ).toEqual(
        `${message} <a href=\"${link}\" target=_blank>${appendedText}</a>.`
      );
    });
  });

  describe('maybeRemoveTrailingPeriod', () => {
    it('should remove trailing periods', () => {
      expect(maybeRemoveTrailingPeriod('hello world.')).toBe('hello world');
      expect(maybeRemoveTrailingPeriod('hello wor..ld')).toBe('hello wor..ld');
      expect(maybeRemoveTrailingPeriod('hello world')).toBe('hello world');
      expect(maybeRemoveTrailingPeriod('hello. world')).toBe('hello. world');
    });
  });
});
