import { RebuildLinodeSchema } from '@linode/validation/lib/linodes.schema';

import { API_ROOT } from '../constants';
import Request, { setData, setMethod, setURL } from '../request';

import type {
  Devices,
  Linode,
  LinodeCloneData,
  RebuildRequest,
  RescueRequestObject,
  ResizeLinodePayload,
} from './types';

/**
 * linodeBoot
 *
 * Boots a Linode you have permission to modify.
 * If no parameters are given, a Config profile will be
 * chosen for this boot based on the following criteria:
 * - If there is only one Config profile for this Linode, it will be used.
 * - If there is more than one Config profile, the last booted config will be used.
 * - If there is more than one Config profile and none were the last to be booted
 *  (because the Linode was never booted or the last booted config was deleted)
 *  an error will be returned.
 *
 * @param linodeId { number } The id of the Linode to boot.
 * @param config_id { number } the ID of the configuration profile to boot from.
 */
export const linodeBoot = (linodeId: number | string, config_id?: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/boot`),
    setMethod('POST'),
    setData({ config_id }),
  );

/**
 * linodeReboot
 *
 * Reboots a Linode you have permission to modify.
 * If any actions are currently running or queued,
 * those actions must be completed first before you can initiate a reboot.
 *
 * @param linodeId { number } The id of the Linode to reboot.
 * @param config_id { number } the ID of the configuration profile to boot from.
 */
export const linodeReboot = (linodeId: number | string, config_id?: number) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/reboot`,
    ),
    setMethod('POST'),
    setData({ config_id }),
  );

/**
 * linodeShutdown
 *
 * Shuts down a Linode you have permission to modify.
 * If any actions are currently running or queued,
 * those actions must be completed first before you can initiate a shutdown.
 *
 * @param linodeId { number } The id of the Linode to shut down.
 */
export const linodeShutdown = (linodeId: number | string) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/shutdown`,
    ),
    setMethod('POST'),
  );

/**
 * resizeLinode
 *
 * Resizes a Linode to a different Type. You must have read_write
 * permission on the target Linode to use this endpoint. If resizing
 * to a smaller Type, the Linode must not have more disk allocation
 * than the new Type allows.
 *
 * @param linodeId { number } The id of the Linode to resize.
 * @param data { object }
 * @param data.type { string } the new size of the Linode
 * @param data.allow_auto_disk_resize { boolean } do you want to resize your disks after
 * the Linode is resized? NOTE: Unless the user has 1 ext disk or 1 ext disk and
 * 1 swap disk, this flag does nothing, regardless of whether it's true or false
 * @param data.migrate_type { string } Warm migrations allow Linodes to remain booted during
 * most of their cold migration, reducing their downtime to the duration of a simple reboot.
 */
export const resizeLinode = (linodeId: number, data: ResizeLinodePayload) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/resize`,
    ),
    setMethod('POST'),
    setData(data),
  );

/**
 * rebuildLinode
 *
 * Rebuilds a Linode you have permission to modify.
 * A rebuild will first shut down the Linode,
 * delete all disks and configs on the Linode,
 * and then deploy a new image to the Linode with the given attributes.
 *
 * @param linodeId { number } The id of the Linode to rebuild.
 * @param data { object }
 * @param data.image { string } the image to be deployed during rebuild.
 * @param data.root_pass { string } the new root password for the default Linode disk
 * @param data.authorized_users { Array(string) } A list of usernames that will have their SSH keys, if any,
 * automatically appended to the root user's authorized keys file.
 */
export const rebuildLinode = (linodeId: number, data: RebuildRequest) =>
  Request<Linode>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/rebuild`,
    ),
    setMethod('POST'),
    setData(data, RebuildLinodeSchema),
  );

/**
 * rescueLinode
 *
 * Boots the Linode into Rescue Mode, a safe environment
 * for performing many system recovery and disk management tasks.
 * Rescue Mode is based on the Finnix recovery distribution, a self-contained
 * and bootable Linux distribution. You can also use Rescue Mode for tasks
 * other than disaster recovery, such as formatting disks to use different
 * filesystems, copying data between disks, and downloading files from a
 * disk via SSH and SFTP.
 *
 * @param linodeId { number } The id of the Linode to boot into rescue mode.
 * @param devices { object } device assignments to be used in rescue mode.
 */
export const rescueLinode = (
  linodeId: number,
  devices: Devices,
): Promise<{}> => {
  const _devices = { ...devices } as any;
  delete _devices['sdh'];
  return Request<{}>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/rescue`,
    ),
    setMethod('POST'),
    setData({ devices: _devices as RescueRequestObject }),
  );
};

/**
 * rescueMetalLinode
 *
 * Boots a Bare Metal Linode into Rescue Mode, a safe environment
 * for performing many system recovery and disk management tasks.
 * Rescue Mode is based on the Finnix recovery distribution, a self-contained
 * and bootable Linux distribution.
 *
 * Bare Metal Linodes have a different rescue flow, since their disks are not
 * managed through the Linode API. This method hits the same endpoint as rescueLinode,
 * but does not accept an array of devices.
 *
 * @param linodeId { number } The id of the Linode to boot into rescue mode.
 */
export const rescueMetalLinode = (linodeId: number): Promise<{}> =>
  Request<{}>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeId)}/rescue`,
    ),
    setMethod('POST'),
  );

/**
 * cloneLinode
 *
 * You can clone your Linode's existing Disks or Configuration profiles to another
 * Linode on your Account. In order for this request to complete successfully,
 * your User must have the add_linodes grant. Cloning to a new Linode will
 * incur a charge on your Account. If cloning to an existing Linode, any actions
 * currently running or queued must be completed first before you can clone to it.
 *
 * @param linodeId { number } The id of the Linode to be cloned.
 */
export const cloneLinode = (sourceLinodeId: number, data: LinodeCloneData) => {
  return Request<Linode>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(sourceLinodeId)}/clone`,
    ),
    setMethod('POST'),
    setData(data),
  );
};

/**
 * startMutation
 *
 * Linodes created with now-deprecated Types are entitled to a free upgrade
 * to the next generation. A mutating Linode will be allocated any new resources
 * the upgraded Type provides, and will be subsequently restarted if it was currently running.
 * If any actions are currently running or queued, those actions must be completed
 * first before you can initiate a mutate.
 *
 * @param linodeId { number } The id of the Linode to be upgraded.
 */
export const startMutation = (linodeID: number) => {
  return Request<{}>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeID)}/mutate`,
    ),
    setMethod('POST'),
  );
};

/**
 * scheduleOrQueueMigration
 *
 * Schedules a pending migration (if one is present on the Linode),
 * or immediately moves a scheduled migration into the migration queue.
 *
 * @param linodeId { number } The id of the Linode to be migrated.
 */
export const scheduleOrQueueMigration = (
  linodeID: number,
  payload?: { region: string },
) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/linode/instances/${encodeURIComponent(linodeID)}/migrate`,
    ),
    setData(payload || {}),
    setMethod('POST'),
  );
