import { Event, GrantLevel, Notification } from '@linode/api-v4/lib/account';
import { Config, Disk } from '@linode/api-v4/lib/linodes';
import { useSelector } from 'react-redux';
import { useGrants } from 'src/queries/profile';
import { useSpecificTypes } from 'src/queries/types';
import { ApplicationState } from 'src/store';
import { eventsForLinode } from 'src/store/events/event.selectors';
import { getLinodeConfigsForLinode } from 'src/store/linodes/config/config.selectors';
import { getLinodeDisksForLinode } from 'src/store/linodes/disk/disk.selectors';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';
import { getPermissionsForLinode } from 'src/store/linodes/permissions/permissions.selector';
import { getNotificationsForLinode } from 'src/store/notification/notification.selector';
import { ExtendedType, extendType } from 'src/utilities/extendType';
import useLinodes from './useLinodes';

export interface ExtendedLinode extends LinodeWithMaintenance {
  _configs: Config[];
  _disks: Disk[];
  _events: Event[];
  _notifications: Notification[];
  _type?: null | ExtendedType;
  _permissions: GrantLevel;
}

export const useExtendedLinode = (linodeId: number): ExtendedLinode | null => {
  const { data: grants } = useGrants();
  const { linodes } = useLinodes();
  const linode = linodes.itemsById[linodeId];
  const typesQuery = useSpecificTypes(linode?.type ? [linode.type] : []);
  const type = typesQuery[0]?.data;

  return useSelector((state: ApplicationState) => {
    if (!linode) {
      return null;
    }

    const { events, __resources } = state;
    const { notifications, linodeConfigs, linodeDisks } = __resources;

    return {
      ...linode,
      _notifications: getNotificationsForLinode(notifications, linodeId),
      _type: type ? extendType(type) : undefined,
      _events: eventsForLinode(events, linodeId),
      _configs: getLinodeConfigsForLinode(linodeConfigs, linodeId),
      _disks: getLinodeDisksForLinode(linodeDisks, linodeId),
      _permissions: getPermissionsForLinode(grants ?? null, linodeId),
    };
  });
};

export default useExtendedLinode;
