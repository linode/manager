import { transitionText } from './transitions';

describe('transitionText helper', () => {
  it('should remove "linode" from the event and capitalize it', () => {
    expect(
      transitionText('loading', {
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
        duration: 0
      })
    ).toEqual('Snapshot');
  });

  it('should use status if an event is missing and capitalize it', () => {
    expect(transitionText('loading')).toEqual('Loading');
  });

  it('should use status if an event is not a transition event and capitalize it', () => {
    expect(
      transitionText('optimus', {
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
        duration: 0
      })
    ).toEqual('Optimus');
  });
});
