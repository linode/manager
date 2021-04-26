import { transitionText } from './transitions';

describe('transitionText helper', () => {
  it('should remove "linode" from the event and capitalize it', () => {
    expect(
      transitionText('loading', 123, {
        id: 123,
        action: 'linode_snapshot',
        secondary_entity: null,
        created: '2012-12-12',
        entity: null,
        percent_complete: null,
        rate: null,
        read: true,
        seen: true,
        status: 'started',
        time_remaining: null,
        username: 'linode',
        duration: 0,
        message: null,
      })
    ).toEqual('Snapshot');
  });

  it('should use status if an event is missing and capitalize it', () => {
    expect(transitionText('loading', 0)).toEqual('Loading');
  });

  it('should use status if an event is not a transition event and capitalize it', () => {
    expect(
      transitionText('optimus', 123, {
        id: 123,
        action: 'linode_addip',
        secondary_entity: null,
        created: '2012-12-12',
        entity: null,
        percent_complete: null,
        rate: null,
        read: true,
        seen: true,
        status: 'started',
        time_remaining: null,
        username: 'linode',
        duration: 0,
        message: null,
      })
    ).toEqual('Optimus');
  });

  it('should use present tense if an event is a transition event and capitalize it', () => {
    expect(
      transitionText('running', 123, {
        id: 123,
        action: 'disk_imagize',
        secondary_entity: {
          id: 12345,
          label: 'Alpine 3.13 Disk',
          type: 'image',
          url: '/v4/images/private/12345',
        },
        created: '2020-12-12',
        entity: null,
        percent_complete: 34,
        rate: null,
        read: false,
        seen: false,
        status: 'started',
        time_remaining: null,
        username: 'linode',
        duration: 12,
        message: null,
      })
    ).toEqual('Capturing Image');
  });
});
