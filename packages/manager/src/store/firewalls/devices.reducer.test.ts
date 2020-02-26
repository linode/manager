import { firewallDeviceFactory } from 'src/factories/firewalls';

import {
  // addFirewallDeviceActions,
  getAllFirewallDevicesActions
  // removeFirewallDeviceActions
} from './devices.actions';
import reducer, { defaultState } from './devices.reducer';

const mockError = [{ reason: 'An error occurred.' }];

describe('Firewall devices reducer', () => {
  it('should handle a get.started action', () => {
    const newState = reducer(
      defaultState,
      getAllFirewallDevicesActions.started({ firewallID: 1 })
    );
    expect(newState).toHaveProperty('1');
    expect(newState['1']).toHaveProperty('lastUpdated', 0);
    expect(newState['1']).toHaveProperty('error', {});
    expect(newState['1']).toHaveProperty('loading', true);
    expect(newState['1']).toHaveProperty('itemsById', {});
    expect(newState['1']).toHaveProperty('results', 0);
  });

  it('should handle a get.done action', () => {
    const mockDevices = firewallDeviceFactory.buildList(3);
    const newState = reducer(
      defaultState,
      getAllFirewallDevicesActions.done({
        params: { firewallID: 1 },
        result: {
          data: mockDevices,
          results: mockDevices.length,
          page: 1,
          pages: 1
        }
      })
    );
    expect(newState).toHaveProperty('1');
    expect(newState['1']).toHaveProperty('error', {});
    expect(Object.values(newState['1'].itemsById)).toEqual(mockDevices);
    expect(newState['1']).toHaveProperty('results', mockDevices.length);
  });

  it('should handle a get.failed action', () => {
    const newState = reducer(
      defaultState,
      getAllFirewallDevicesActions.failed({
        params: { firewallID: 1 },
        error: mockError
      })
    );

    expect(newState['1'].error).toHaveProperty('read', mockError);
  });
});
