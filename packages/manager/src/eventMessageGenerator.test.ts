import { Event } from 'linode-js-sdk/lib/account';
import getEventMessage, { eventMessageCreators } from './eventMessageGenerator';

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
