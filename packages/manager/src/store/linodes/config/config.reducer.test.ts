import { configFactory } from 'src/factories/config';
import { deleteLinodeActions } from '../linodes.actions';
import {
  createLinodeConfigActions,
  deleteLinodeConfigActions,
  getAllLinodeConfigsActions,
  getLinodeConfigActions,
  updateLinodeConfigActions,
} from './config.actions';
import reducer, { State } from './config.reducer';
import { Entity } from './config.types';

describe('config reducer', () => {
  const defaultState: State = {};
  const mockConfig1 = {
    ...configFactory.build({
      id: 2,
      label: 'test-config1',
    }),
    linode_id: 1,
  };
  const mockConfig2 = {
    ...configFactory.build({
      id: 3,
      label: 'test-config2',
    }),
    linode_id: 1,
  };

  describe('getLinodeConfigActions', () => {
    it('should set loading to `true` and error to `undefined` when starting the request', () => {
      const newState = reducer(
        defaultState,
        getLinodeConfigActions.started({
          linodeId: mockConfig1.linode_id,
          configId: mockConfig1.id,
        })
      );
      expect(newState).toHaveProperty(String(mockConfig1.linode_id));
      expect(newState[mockConfig1.linode_id]).toHaveProperty('loading', true);
      expect(newState[mockConfig1.linode_id].error).toHaveProperty(
        'read',
        undefined
      );
    });
    it('should load data when the request has been completed', () => {
      const newState = reducer(
        defaultState,
        getLinodeConfigActions.done({
          params: { linodeId: mockConfig1.linode_id, configId: mockConfig1.id },
          result: mockConfig1,
        })
      );
      verifyConfig(newState, mockConfig1);
    });
  });

  describe('getAllLinodeConfigsActions', () => {
    it('should set loading to `true` and error to `undefined` when the request is started', () => {
      const newState = reducer(
        defaultState,
        getAllLinodeConfigsActions.started({
          linodeId: mockConfig1.linode_id,
        })
      );
      expect(newState).toHaveProperty(String(mockConfig1.linode_id));
      expect(newState[mockConfig1.linode_id]).toHaveProperty('loading', true);
      expect(newState[mockConfig1.linode_id].error).toHaveProperty(
        'read',
        undefined
      );
    });
    it('should load data when the request has been completed', () => {
      const newState = reducer(
        defaultState,
        getAllLinodeConfigsActions.done({
          params: { linodeId: mockConfig1.linode_id },
          result: { data: [mockConfig1, mockConfig2], results: 2 },
        })
      );
      verifyConfig(newState, mockConfig1);
      verifyConfig(newState, mockConfig2);
      expect(newState[mockConfig1.linode_id].results).toBe(2);
    });
    it('sets error.read when the request fails', () => {
      const errorMessage = 'An error occurred.';
      const newState = reducer(
        defaultState,
        getAllLinodeConfigsActions.failed({
          params: { linodeId: mockConfig1.linode_id },
          error: [{ reason: errorMessage }],
        })
      );
      expect(newState[mockConfig1.linode_id].error).toHaveProperty('read');
      expect(newState[mockConfig1.linode_id].loading).toBe(false);
      expect(newState[mockConfig1.linode_id].error?.read?.[0].reason).toBe(
        errorMessage
      );
    });
  });

  describe('createLinodeConfigActions', () => {
    it('loads the config when the request is complete', () => {
      const newState = reducer(
        defaultState,
        createLinodeConfigActions.done({
          params: {
            linodeId: 1,
            label: mockConfig1.label,
            devices: mockConfig1.devices,
            root_device: mockConfig1.root_device,
            helpers: mockConfig1.helpers,
          },
          result: mockConfig1,
        })
      );
      verifyConfig(newState, mockConfig1);
    });
  });

  describe('updateLinodeConfigActions', () => {
    it('updates the config when the request is complete', () => {
      const newState = reducer(
        defaultState,
        updateLinodeConfigActions.done({
          params: {
            linodeId: mockConfig1.linode_id,
            configId: mockConfig1.id,
            label: mockConfig1.label,
          },
          result: mockConfig1,
        })
      );
      verifyConfig(newState, mockConfig1);
    });
  });

  describe('deleteLinodeConfigActions', () => {
    const state: State = {
      [mockConfig1.linode_id]: {
        results: 1,
        itemsById: { [mockConfig1.id]: mockConfig1 },
        lastUpdated: 1,
        loading: false,
        error: {},
      },
      [mockConfig2.linode_id]: {
        results: 1,
        itemsById: { [mockConfig2.id]: mockConfig2 },
        lastUpdated: 1,
        loading: false,
        error: {},
      },
    };

    it('sets error.delete to `undefined` when the request is started', () => {
      const newState = reducer(
        state,
        deleteLinodeConfigActions.started({
          linodeId: mockConfig1.linode_id,
          configId: mockConfig1.id,
        })
      );
      expect(newState[mockConfig1.linode_id].error?.delete).toBeUndefined();
    });
    it('removes the config when the request is complete', () => {
      const newState = reducer(
        state,
        deleteLinodeConfigActions.done({
          params: {
            linodeId: mockConfig1.linode_id,
            configId: mockConfig1.id,
          },
          result: {},
        })
      );
      expect(
        newState[mockConfig1.linode_id].itemsById[mockConfig1.id]
      ).toBeUndefined();
      expect(newState[mockConfig1.linode_id].results).toBe(1);
    });
  });

  describe('deleteLinodeActions', () => {
    const state = reducer(
      defaultState,
      createLinodeConfigActions.done({
        params: {
          linodeId: mockConfig1.linode_id,
        } as any,
        result: mockConfig1,
      })
    );
    it('removes the linodeId from the state when the request is complete', () => {
      const newState = reducer(
        state,
        deleteLinodeActions.done({
          params: { linodeId: mockConfig1.linode_id },
          result: {},
        })
      );
      expect(newState[mockConfig1.linode_id]).toBeUndefined();
    });
  });
});

const verifyConfig = (state: State, config: Entity) => {
  expect(state[config.linode_id].loading).toBe(false);
  expect(state[config.linode_id].results).toBe(
    Object.keys(state[config.linode_id].itemsById).length
  );
  expect(state[config.linode_id].itemsById[config.id]).toEqual(config);
};
