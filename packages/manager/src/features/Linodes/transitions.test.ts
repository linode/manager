import { transitionText } from './transitions';
import { eventFactory } from 'src/factories/events';

describe('transitionText helper', () => {
  it('should use status if an event is missing and capitalize it', () => {
    expect(transitionText('loading', 0)).toEqual('Loading');
  });

  it('should use status if an event is not a transition event and capitalize it', () => {
    const mockEvent = eventFactory.build({ action: 'linode_addip' });
    expect(transitionText('optimus', mockEvent.id, mockEvent)).toEqual(
      'Optimus'
    );
  });

  it('should use present continuous tense if an event is a transition event and capitalize it', () => {
    const mockEvent = eventFactory.build({ action: 'disk_imagize' });
    expect(transitionText('running', mockEvent.id, mockEvent)).toEqual(
      'Capturing Image'
    );
  });
});
