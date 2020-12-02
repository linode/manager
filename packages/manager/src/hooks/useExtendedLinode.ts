import { Event, GrantLevel, Notification } from '@linode/api-v4/lib/account';
import {
  Config,
  Disk,
  LinodeInterface,
  LinodeType
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { Volume } from '@linode/api-v4/lib/volumes';
import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { eventsForLinode } from 'src/store/events/event.selectors';
import { getLinodeConfigsForLinode } from 'src/store/linodes/config/config.selectors';
import { getLinodeDisksForLinode } from 'src/store/linodes/disk/disk.selectors';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector';
import { getTypeById } from 'src/store/linodeType/linodeType.selector';
import { getNotificationsForLinode } from 'src/store/notification/notification.selector';
import { getVolumesForLinode } from 'src/store/volume/volume.selector';

export interface ExtendedLinode extends LinodeWithMaintenance {
  _configs: Config[];
  _disks: Disk[];
  _interfaces: LinodeInterface[];
  _events: Event[];
  _notifications: Notification[];
  _volumes: Volume[];
  _volumesError?: APIError[];
  _type?: null | LinodeType;
  _permissions: GrantLevel;
}

export const useExtendedLinode = (linodeId: number): ExtendedLinode | null => {
  return useSelector((state: ApplicationState) => {
    const { events, __resources } = state;
    const {
      volumes,
      notifications,
      types,
      linodeConfigs,
      linodeDisks,
      interfaces,
      profile
    } = __resources;
    const linode = state.__resources.linodes.itemsById[linodeId];
    if (!linode) {
      return null;
    }

    const { type } = linode;

    return {
      ...linode,
      _volumes: getVolumesForLinode(volumes.itemsById, linodeId),
      _volumesError: volumes.error.read,
      _notifications: getNotificationsForLinode(notifications, linodeId),
      _type: getTypeById(types, type),
      _events: eventsForLinode(events, linodeId),
      _configs: getLinodeConfigsForLinode(linodeConfigs, linodeId),
      _disks: getLinodeDisksForLinode(linodeDisks, linodeId),
      _interfaces: Object.values(interfaces[linodeId]?.itemsById ?? {}),
      _permissions: getPermissionsForLinode(profile.data ?? null, linodeId)
    };
  });
};

export default useExtendedLinode;
