/**
 * @note Make sure you add the linode_id to the disk object!`
 */

import {
  createLinodeDisk as _createLinodeDisk,
  deleteLinodeDisk as _deleteLinodeDisk,
  Disk,
  getLinodeDisk as _getLinodeDisk,
  getLinodeDisks as _getLinodeDisks,
  resizeLinodeDisk as _resizeLinodeDisk,
  updateLinodeDisk as _updateLinodeDisk,
} from '@linode/api-v4/lib/linodes';
import { createRequestThunk } from 'src/store/store.helpers';
import { getAll } from 'src/utilities/getAll';
import {
  createLinodeDiskActions,
  deleteLinodeDiskActions,
  getAllLinodeDisksActions,
  getLinodeDiskActions,
  getLinodeDisksActions,
  resizeLinodeDiskActions,
  updateLinodeDiskActions,
} from './disk.actions';
import { Entity } from './disk.types';

const addLinodeIdToDisk = (linodeId: number) => (disk: Disk): Entity => ({
  ...disk,
  linode_id: linodeId,
});

export const createLinodeDisk = createRequestThunk(
  createLinodeDiskActions,
  ({ linodeId, ...data }) =>
    _createLinodeDisk(linodeId, data).then(addLinodeIdToDisk(linodeId))
);

export const getLinodeDisks = createRequestThunk(
  getLinodeDisksActions,
  ({ linodeId }) =>
    _getLinodeDisks(linodeId).then((result) => ({
      results: result.results,
      data: result.data.map(addLinodeIdToDisk(linodeId)),
    }))
);

export const getAllLinodeDisks = createRequestThunk(
  getAllLinodeDisksActions,
  ({ linodeId }) =>
    getAll<Entity>((diskParams: any, filter: any) =>
      _getLinodeDisks(linodeId, diskParams, filter)
    )().then((result) => ({
      results: result.results,
      data: result.data.map(addLinodeIdToDisk(linodeId)),
    }))
);

export const getLinodeDisk = createRequestThunk(
  getLinodeDiskActions,
  ({ linodeId, diskId }) =>
    _getLinodeDisk(linodeId, diskId).then(addLinodeIdToDisk(linodeId))
);

export const updateLinodeDisk = createRequestThunk(
  updateLinodeDiskActions,
  ({ linodeId, diskId, ...data }) =>
    _updateLinodeDisk(linodeId, diskId, data).then(addLinodeIdToDisk(linodeId))
);

export const deleteLinodeDisk = createRequestThunk(
  deleteLinodeDiskActions,
  ({ linodeId, diskId }) => _deleteLinodeDisk(linodeId, diskId)
);

export const resizeLinodeDisk = createRequestThunk(
  resizeLinodeDiskActions,
  ({ linodeId, diskId, size }) =>
    _resizeLinodeDisk(linodeId, diskId, size).then(addLinodeIdToDisk(linodeId))
);
