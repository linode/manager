import { firewallDeviceFactory } from 'src/factories/firewalls';

import {
  addFirewallDeviceActions,
  getAllFirewallDevicesActions,
  removeFirewallDeviceActions,
} from './devices.actions';
import reducer, { defaultState } from './devices.reducer';

const mockError = [{ reason: 'An error occurred.' }];

const mockDevices = firewallDeviceFactory.buildList(3);

const addDevice = () =>
  reducer(
    defaultState,
    getAllFirewallDevicesActions.done({
      params: { firewallID: 1 },
      result: {
        data: mockDevices,
        results: mockDevices.length,
        page: 1,
        pages: 1,
      },
    })
  );

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
    const newState = reducer(
      defaultState,
      getAllFirewallDevicesActions.done({
        params: { firewallID: 1 },
        result: {
          data: mockDevices,
          results: mockDevices.length,
          page: 1,
          pages: 1,
        },
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
        error: mockError,
      })
    );

    expect(newState['1'].error).toHaveProperty('read', mockError);
    expect(newState['1']).toHaveProperty('loading', false);
  });

  it('should handle an add.started action', () => {
    const oldState = addDevice();
    const newState = reducer(
      { ...oldState, '1': { ...oldState['1'], error: { create: mockError } } },
      addFirewallDeviceActions.started({
        firewallID: 1,
        type: 'linode',
        id: 10,
      })
    );

    expect(newState['1']).toHaveProperty('error', { create: undefined });
  });

  it('should handle an add.done action', () => {
    const newDevicePayload = { firewallID: 1, type: 'linode' as any, id: 10 };
    const newDeviceResponse = firewallDeviceFactory.build({
      entity: { type: newDevicePayload.type, id: newDevicePayload.id },
    });
    const newState = reducer(
      defaultState,
      addFirewallDeviceActions.done({
        params: newDevicePayload,
        result: newDeviceResponse,
      })
    );

    expect(newState['1'].itemsById[newDeviceResponse.id]).toEqual(
      newDeviceResponse
    );
    expect(newState['1']).toHaveProperty('results', 1);
  });

  it('should handle an add.failed action', () => {
    const newDevicePayload = { firewallID: 1, type: 'linode' as any, id: 10 };
    const newState = reducer(
      defaultState,
      addFirewallDeviceActions.failed({
        params: newDevicePayload,
        error: mockError,
      })
    );

    expect(newState['1'].error).toHaveProperty('create', mockError);
  });

  it('should handle a remove.start action', () => {
    const oldState = addDevice();
    const newState = reducer(
      { ...oldState, '1': { ...oldState['1'], error: { delete: mockError } } },
      removeFirewallDeviceActions.started({
        firewallID: 1,
        deviceID: mockDevices[0].id,
      })
    );
    expect(newState['1'].error).toHaveProperty('delete', undefined);
  });

  it('should handle a remove.done action', () => {
    const oldState = addDevice();
    const newState = reducer(
      oldState,
      removeFirewallDeviceActions.done({
        params: { firewallID: 1, deviceID: mockDevices[0].id },
        result: {},
      })
    );

    expect(newState['1'].itemsById).not.toHaveProperty(
      String(mockDevices[0].id)
    );
    expect(newState['1'].results).toBe(2);
  });

  it('should handle a remove.failed action', () => {
    const newState = reducer(
      defaultState,
      removeFirewallDeviceActions.failed({
        params: { firewallID: 1, deviceID: 2 },
        error: mockError,
      })
    );

    expect(newState['1'].error).toHaveProperty('delete', mockError);
  });

  it("trying to delete something nonexistent doesn't break anything", () => {
    const oldState = addDevice();
    const newState = reducer(
      oldState,
      removeFirewallDeviceActions.done({
        params: { firewallID: 1, deviceID: Infinity },
        result: {},
      })
    );
    // Can't just compare states because of lastUpdated variance
    expect(newState['1'].itemsById).toEqual(oldState['1'].itemsById);
    expect(newState['1'].results).toEqual(oldState['1'].results);
    expect(newState['1'].error).toEqual(oldState['1'].error);
  });
});
