import { transitionText } from './transitions';
import { eventFactory } from 'src/factories/events';

describe('transitionText helper', () => {
  it('should remove "linode" from the event and capitalize it', () => {
    const mockEvent = eventFactory.build({
      action: 'linode_snapshot',
      percent_complete: null,
      read: true,
      seen: true,
    });
    expect(transitionText('loading', mockEvent.id, mockEvent)).toEqual(
      'Snapshot'
    );
  });

  it('should use status if an event is missing and capitalize it', () => {
    expect(transitionText('loading', 0)).toEqual('Loading');
  });

  it('should use status if an event is not a transition event and capitalize it', () => {
    const mockEvent = eventFactory.build({
      action: 'linode_addip',
      percent_complete: null,
      read: true,
      seen: true,
    });
    expect(transitionText('optimus', mockEvent.id, mockEvent)).toEqual(
      'Optimus'
    );
  });

  it('should use present continuous tense if an event is a transition event and capitalize it', () => {
    const mockEvent = eventFactory.build({
      action: 'disk_imagize',
      secondary_entity: {
        id: 12345,
        label: 'Alpine 3.13 Disk',
        type: 'image',
        url: '/v4/images/private/12345',
      },
    });
    expect(transitionText('running', mockEvent.id, mockEvent)).toEqual(
      'Capturing Image'
    );
  });
});
