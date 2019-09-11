import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '../request';

import { CreateSnapshotSchema } from './linodes.schema';
import { LinodeBackup, LinodeBackupsResponse } from './types';

type Backup = LinodeBackup;

/**
 * getLinodeBackups
 *
 * Returns information about this Linode's available backups.
 *
 * @param linodeId { number } The id of a Linode with backups enabled.
 */
export const getLinodeBackups = (id: number) =>
  Request<LinodeBackupsResponse>(
    setURL(`${API_ROOT}/linode/instances/${id}/backups`),
    setMethod('GET')
  ).then(response => response.data);

/**
 * enableBackups
 *
 * Enable backups service for a single Linode.
 *
 * @param linodeId { number } The id of the Linode to enable backup services for.
 */
export const enableBackups = (linodeId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/backups/enable`),
    setMethod('POST')
  );

/**
 * cancelBackups
 *
 * Cancel backups service for the specified Linode.
 *
 * @param linodeId { number } The id of a Linode with backups enabled.
 */
export const cancelBackups = (linodeId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/backups/cancel`),
    setMethod('POST')
  );

/**
 * takeSnapshot
 *
 * Creates a snapshot Backup of a Linode. If you already have a snapshot
 * of this Linode, this is a destructive action. The previous snapshot will be deleted.
 *
 * @param linodeId { number } The id of the Linode to retrieve.
 * @param label { string } A label to identify the new snapshot.
 */
export const takeSnapshot = (linodeId: number, label: string) =>
  Request<Backup>(
    setURL(`${API_ROOT}/linode/instances/${linodeId}/backups`),
    setMethod('POST'),
    setData({ label }, CreateSnapshotSchema)
  );

/**
 * restoreBackup
 *
 * Restores a Linode's Backup to the specified Linode.
 *
 * @param linodeId { number } The id of the Linode that the backup belongs to.
 * @param backupId { number } The id of the backup to restore from.
 * @param targetLinodeId { number } The id of the Linode to restore the backup to.
 * @param overwrite: { boolean } If True, deletes all Disks and Configs on the
 * target Linode before restoring.
 */
export const restoreBackup = (
  linodeId: number,
  backupId: number,
  targetLinodeId: number,
  overwrite: boolean
) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/linode/instances/${linodeId}/backups/${backupId}/restore`
    ),
    setMethod('POST'),
    setData({ linode_id: targetLinodeId, overwrite })
  ).then(response => response.data);
