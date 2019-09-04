/**
 * @note Make sure you add the linode_id to the disk object!`
 */

import {
  createLinodeDisk as _createLinodeDisk,
  deleteLinodeDisk as _deleteLinodeDisk,
  getLinodeDisk as _getLinodeDisk,
  getLinodeDisks as _getLinodeDisks,
  resizeLinodeDisk as _resizeLinodeDisk,
  updateLinodeDisk as _updateLinodeDisk
} from 'linode-js-sdk/lib/linodes';
import { createRequestThunk } from 'src/store/store.helpers';
import { ThunkActionCreator } from 'src/store/types';
import { getAll } from 'src/utilities/getAll';
import {
  createLinodeDiskActions,
  deleteLinodeDiskActions,
  getAllLinodeDisksActions,
  GetAllLinodeDisksParams,
  getLinodeDiskActions,
  getLinodeDisksActions,
  resizeLinodeDiskActions,
  updateLinodeDiskActions
} from './disk.actions';
import { Entity } from './disk.types';

const addLinodeIdToDisk = (linodeId: number) => (
  disk: Linode.Disk
): Entity => ({
  ...disk,
  linode_id: linodeId
});

export const createLinodeDisk = createRequestThunk(
  createLinodeDiskActions,
  ({ linodeId, ...data }) =>
    _createLinodeDisk(linodeId, data).then(addLinodeIdToDisk(linodeId))
);

export const getLinodeDisks = createRequestThunk(
  getLinodeDisksActions,
  ({ linodeId }) =>
    _getLinodeDisks(linodeId)
      .then(({ data }) => data)
      .then(disks => disks.map(addLinodeIdToDisk(linodeId)))
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

export const getAllLinodeDisks: ThunkActionCreator<Promise<Entity[]>> = (
  params: GetAllLinodeDisksParams
) => async dispatch => {
  const { linodeId } = params;
  const { started, done, failed } = getAllLinodeDisksActions;
  dispatch(started(params));
  const req = getAll<Entity>((diskParams: any, filter: any) =>
    _getLinodeDisks(linodeId, diskParams, filter)
  );

  try {
    const { data } = await req();
    dispatch(done({ params, result: data.map(addLinodeIdToDisk(linodeId)) }));
    return data;
  } catch (error) {
    dispatch(failed({ params, error }));
    return error;
  }
};

export const resizeLinodeDisk = createRequestThunk(
  resizeLinodeDiskActions,
  ({ linodeId, diskId, size }) =>
    _resizeLinodeDisk(linodeId, diskId, size)
      .then(({ data }) => data)
      .then(addLinodeIdToDisk(linodeId))
);
