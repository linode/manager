import {
  CreateLinodeDiskSchema,
  ResizeLinodeDiskSchema,
  UpdateLinodePasswordSchema,
} from '@linode/validation/lib/linodes.schema';

import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type { Disk, LinodeDiskCreationData } from './types';

/**
 * getLinodeDisks
 *
 * Returns a paginated list of disks associated with the specified Linode.
 *
 * @param linodeId { number } The id of the Linode to list disks for.
 */
export const getLinodeDisks = (
  linodeId: number,
  params?: Params,
  filter?: Filter,
) =>
  Request<Page<Disk>>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/disks`,
    ),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * createLinodeDisk
 *
 * Lists Configuration profiles associated with the specified Linode.
 *
 * @param linodeId { number } The id of the Linode to list configs for.
 */
export const createLinodeDisk = (
  linodeId: number,
  data: LinodeDiskCreationData,
) =>
  Request<Disk>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/disks`,
    ),
    setMethod('POST'),
    setData(data, CreateLinodeDiskSchema),
  );

/**
 * getLinodeDisk
 *
 * Retrieve detailed information about a single Disk.
 *
 * @param linodeId { number } The id of the Linode containing the disk to be viewed.
 * @param diskId { number } The id of the disk to be viewed.
 */
export const getLinodeDisk = (linodeId: number, diskId: number) =>
  Request<Disk>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId,
      )}/disks/${encodeURIComponent(diskId)}`,
    ),
    setMethod('GET'),
  );

/**
 * updateLinodeDisk
 *
 * Update settings for a disk. Fields not specified will be left unchanged.
 *
 * @param linodeId { number } The id of the Linode containing the disk to be updated.
 * @param diskId { number } The id of the disk to be updated.
 */
export const updateLinodeDisk = (
  linodeId: number,
  diskId: number,
  data: Pick<LinodeDiskCreationData, 'label'>,
) =>
  Request<Disk>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId,
      )}/disks/${encodeURIComponent(diskId)}`,
    ),
    setMethod('PUT'),
    setData(data),
  );

/**
 * resizeLinodeDisk
 *
 * Resizes a Disk you have permission to read_write.
 * The Linode this Disk is attached to must be shut down for resizing to take effect.
 * If you are resizing the Disk to a smaller size, it cannot be made smaller than
 * what is required by the total size of the files current on the Disk.
 * The Disk must not be in use. If the Disk is in use, the request will
 * succeed but the resize will ultimately fail.
 *
 * @param linodeId { number } The id of the Linode containing the disk to be resized.
 * @param diskId { number } The id of the disk to be resized.
 * @param size { number } The intended size of the disk (in MB).
 */
export const resizeLinodeDisk = (
  linodeId: number,
  diskId: number,
  size: number,
) =>
  Request<Disk>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId,
      )}/disks/${encodeURIComponent(diskId)}/resize`,
    ),
    setMethod('POST'),
    setData({ size }, ResizeLinodeDiskSchema),
  );

/**
 * cloneLinodeDisk
 *
 * Clones (duplicates) a Disk on an individual Linode.
 * @param linodeId { number } The id of the Linode containing the disk to be resized.
 * @param diskId { number } The id of the disk to be resized.
 */
export const cloneLinodeDisk = (linodeId: number, diskId: number) =>
  Request<Disk>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId,
      )}/disks/${encodeURIComponent(diskId)}/clone`,
    ),
    setMethod('POST'),
  );

/**
 * deleteLinodeDisk
 *
 * Deletes a Disk you have permission to read_write.
 *
 * @param linodeId { number } The id of the Linode containing the disk to be deleted.
 * @param diskId { number } The id of the disk to be deleted.
 */
export const deleteLinodeDisk = (linodeId: number, diskId: number) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId,
      )}/disks/${encodeURIComponent(diskId)}`,
    ),
    setMethod('DELETE'),
  );

/**
 * changeLinodeDiskPassword
 *
 * Resets the password of a Disk you have permission to read_write.
 *
 * @param linodeId { number } The id of the Linode containing the target disk.
 * @param diskId { number } The id of the target disk.
 * @param password { string } The new disk password.
 */
export const changeLinodeDiskPassword = (
  linodeId: number,
  diskId: number,
  password: string,
) =>
  Request<Disk>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(
        linodeId,
      )}/disks/${encodeURIComponent(diskId)}/password`,
    ),
    setMethod('POST'),
    setData({ password }, UpdateLinodePasswordSchema),
  );
