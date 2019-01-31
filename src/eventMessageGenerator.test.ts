import getEventMessage, { eventMessageCreators } from './eventMessageGenerator';

describe('getEventMessage', () => {
  it('should filter unknown events', () => {
    const mockEvent = {
      action: '__unknown__',
      status: 'started'
    };
    const result = getEventMessage(mockEvent as Linode.Event);

    expect(result).toBeUndefined();
  });

  it('should filter mangled events', () => {
    const mockEvent = {
      action: 'linode_reboot',
      status: 'scheduled',
      entity: null
    };
    const result = getEventMessage(mockEvent as Linode.Event);

    expect(result).toBeUndefined();
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
    getEventMessage(mockEvent as Linode.Event);

    /** Check that the mocked creator was called w/ the mock event. */
    expect(eventMessageCreators.linode_reboot.scheduled).toHaveBeenCalledWith(
      mockEvent
    );
  });
});
