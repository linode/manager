import { Event, GrantLevel, Notification } from '@linode/api-v4/lib/account';
import { Config, Disk, LinodeType } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { Volume } from '@linode/api-v4/lib/volumes';
import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { eventsForLinode } from 'src/store/events/event.selectors';
import { getLinodeConfigsForLinode } from 'src/store/linodes/config/config.selectors';
import { getLinodeDisksForLinode } from 'src/store/linodes/disk/disk.selectors';
import { shallowExtendLinodes } from 'src/store/linodes/linodes.helpers';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector';
import { ShallowExtendedLinode } from 'src/store/linodes/types';
import { getTypeById } from 'src/store/linodeType/linodeType.selector';
import { getNotificationsForLinode } from 'src/store/notification/notification.selector';
import { getVolumesForLinode } from 'src/store/volume/volume.selector';

export interface DeepExtendedLinode extends ShallowExtendedLinode {
  _configs: Config[];
  _disks: Disk[];
  _events: Event[];
  _notifications: Notification[];
  _volumes: Volume[];
  _volumesError?: APIError[];
  _type?: null | LinodeType;
  _permissions: GrantLevel;
}

export const useExtendedLinode = (
  linodeId: number
): DeepExtendedLinode | null => {
  return useSelector((state: ApplicationState) => {
    const { events, __resources } = state;
    const {
      volumes,
      notifications,
      types,
      linodeConfigs,
      linodeDisks,
      profile
    } = __resources;
    const linode = state.__resources.linodes.itemsById[linodeId];
    if (!linode) {
      return null;
    }

    const { type } = linode;

    // @todo: clean up the helper function so we don't have to deal with arrays.
    const shallowExtendedLinode = shallowExtendLinodes(
      [linode],
      notifications.data ?? [],
      events.events
    )[0];

    return {
      ...shallowExtendedLinode,
      _volumes: getVolumesForLinode(volumes.itemsById, linodeId),
      _volumesError: volumes.error.read,
      _notifications: getNotificationsForLinode(notifications, linodeId),
      _type: getTypeById(types, type),
      _events: eventsForLinode(events, linodeId),
      _configs: getLinodeConfigsForLinode(linodeConfigs, linodeId),
      _disks: getLinodeDisksForLinode(linodeDisks, linodeId),
      _permissions: getPermissionsForLinode(profile.data ?? null, linodeId)
    };
  });
};

export default useExtendedLinode;
