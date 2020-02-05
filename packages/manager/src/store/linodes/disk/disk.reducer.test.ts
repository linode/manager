// import { diskFactory } from 'src/factories/disk';
import { diskFactory } from 'src/factories/disk';
import { deleteLinodeActions } from '../linodes.actions';
import {
  createLinodeDiskActions,
  deleteLinodeDiskActions,
  getAllLinodeDisksActions,
  getLinodeDiskActions,
  updateLinodeDiskActions
} from './disk.actions';
import reducer, { State } from './disk.reducer';
import { Entity } from './disk.types';

describe('Disk reducer', () => {
  const defaultState: State = {};
  const mockDisk1 = {
    ...diskFactory.build({
      id: 2,
      label: 'test-disk1',
      size: 1000
    }),
    linode_id: 1
  };
  const mockDisk2 = {
    ...diskFactory.build({
      id: 3,
      label: 'test-disk2',
      size: 2000
    }),
    linode_id: 1
  };

  describe('getLinodeDiskActions', () => {
    it('should set loading to `true` and error to `undefined` when starting the request', () => {
      const newState = reducer(
        defaultState,
        getLinodeDiskActions.started({
          linodeId: mockDisk1.linode_id,
          diskId: mockDisk1.id
        })
      );
      expect(newState).toHaveProperty(String(mockDisk1.linode_id));
      expect(newState[mockDisk1.linode_id]).toHaveProperty('loading', true);
      expect(newState[mockDisk1.linode_id]).toHaveProperty('error', undefined);
    });
    it('should load data when the request has been completed', () => {
      const newState = reducer(
        defaultState,
        getLinodeDiskActions.done({
          params: { linodeId: mockDisk1.linode_id, diskId: mockDisk1.id },
          result: mockDisk1
        })
      );
      verifyDisk(newState, mockDisk1);
    });
  });

  describe('createLinodeDiskActions', () => {
    it('loads the disk when the request is complete', () => {
      const newState = reducer(
        defaultState,
        createLinodeDiskActions.done({
          params: {
            linodeId: mockDisk1.linode_id,
            label: mockDisk1.label,
            size: mockDisk1.size
          },
          result: mockDisk1
        })
      );
      verifyDisk(newState, mockDisk1);
    });
  });

  describe('updateLinodeDiskActions', () => {
    it('updates the disk when the request is complete', () => {
      const newState = reducer(
        defaultState,
        updateLinodeDiskActions.done({
          params: {
            linodeId: mockDisk1.linode_id,
            diskId: mockDisk1.id,
            label: 'test-disk'
          },
          result: mockDisk1
        })
      );
      verifyDisk(newState, mockDisk1);
    });
  });

  describe('deleteLinodeDiskActions', () => {
    // Create state with disks.
    let state = reducer(
      defaultState,
      createLinodeDiskActions.done({
        params: {
          linodeId: mockDisk1.linode_id
        } as any,
        result: mockDisk1
      })
    );
    state = reducer(
      state,
      createLinodeDiskActions.done({
        params: {
          linodeId: mockDisk2.linode_id
        } as any,
        result: mockDisk2
      })
    );

    it('sets error.delete to `undefined` when the request is started', () => {
      const newState = reducer(
        state,
        deleteLinodeDiskActions.started({
          linodeId: mockDisk1.linode_id,
          diskId: mockDisk1.id
        })
      );
      expect(newState[mockDisk1.linode_id].error?.delete).toBeUndefined();
    });
    it('removes the disk when the request is complete', () => {
      const newState = reducer(
        state,
        deleteLinodeDiskActions.done({
          params: {
            linodeId: mockDisk1.linode_id,
            diskId: mockDisk1.id
          },
          result: {}
        })
      );
      expect(
        newState[mockDisk1.linode_id].itemsById[mockDisk1.id]
      ).toBeUndefined();
      expect(newState[mockDisk1.linode_id].items).toHaveLength(1);
    });
  });

  describe('getAllLinodeDisksActions', () => {
    it('should set loading to `true` and error to `undefined` when the request is started', () => {
      const newState = reducer(
        defaultState,
        getAllLinodeDisksActions.started({
          linodeId: mockDisk1.linode_id
        })
      );
      expect(newState).toHaveProperty(String(mockDisk1.linode_id));
      expect(newState[mockDisk1.linode_id]).toHaveProperty('loading', true);
      expect(newState[mockDisk1.linode_id]).toHaveProperty('error', undefined);
    });
    it('should load data when the request has been completed', () => {
      const newState = reducer(
        defaultState,
        getAllLinodeDisksActions.done({
          params: { linodeId: mockDisk1.linode_id },
          result: [mockDisk1, mockDisk2]
        })
      );
      verifyDisk(newState, mockDisk1);
      verifyDisk(newState, mockDisk2);
      expect(newState[mockDisk1.linode_id].items.length).toBe(2);
    });
    it('sets error.read when the request fails', () => {
      const errorMessage = 'An error occurred.';
      const newState = reducer(
        defaultState,
        getAllLinodeDisksActions.failed({
          params: { linodeId: mockDisk1.linode_id },
          error: [{ reason: errorMessage }]
        })
      );
      expect(newState[mockDisk1.linode_id].error).toHaveProperty('read');
      expect(newState[mockDisk1.linode_id].loading).toBe(false);
      expect(newState[mockDisk1.linode_id].error?.read?.[0].reason).toBe(
        errorMessage
      );
    });
  });
  describe('deleteLinodeActions', () => {
    const state = reducer(
      defaultState,
      createLinodeDiskActions.done({
        params: {
          linodeId: mockDisk1.linode_id
        } as any,
        result: mockDisk1
      })
    );

    it('removes the linodeId from the state when the request is complete', () => {
      const newState = reducer(
        state,
        deleteLinodeActions.done({
          params: { linodeId: mockDisk1.linode_id },
          result: {}
        })
      );
      expect(newState[mockDisk1.linode_id]).toBeUndefined();
    });
  });
});

const verifyDisk = (state: State, disk: Entity) => {
  expect(state[disk.linode_id].loading).toBe(false);
  expect(state[disk.linode_id].items.includes(String(disk.id))).toBe(true);
  expect(state[disk.linode_id].itemsById[disk.id]).toEqual(disk);
};
