import { Notification } from '@linode/api-v4/lib/account';
import { Linode } from '@linode/api-v4/lib/linodes/types';
import { Region } from '@linode/api-v4/lib/regions/types';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import { dcDisplayNames } from 'src/constants';
import useLinodes from 'src/hooks/useLinodes';
import useNotifications from 'src/hooks/useNotifications';
import useRegions from 'src/hooks/useRegions';
import { NotificationItem } from '../NotificationSection';

interface LinodeWithNotification extends Linode {
  notification?: Notification;
}

export const useSystemStatusData = (): NotificationItem[] => {
  const { linodes } = useLinodes();
  const { entities: regions } = useRegions();
  const notifications = useNotifications();

  const linodesWithNotifications = Object.values(linodes.itemsById).reduce(
    (acc, thisLinode) => {
      const notification = notifications.find(
        thisNotification => thisNotification.entity?.id === thisLinode.id
      );
      if (!notification) {
        return acc;
      }
      const linodeWithNotification = { ...thisLinode, notification };
      return [...acc, linodeWithNotification];
    },
    []
  );

  const regionsWithOutages = regions.filter(
    thisRegion => thisRegion.status === 'outage'
  );

  const outages = regionsWithOutages.map(regionToNotificationItem);

  const inProgressMaintenance = linodesWithNotifications
    .filter(thisLinode => thisLinode.status === 'stopped')
    .map(inProgressMaintenanceToItem);

  const data = [...outages, ...inProgressMaintenance];

  const pendingMaintenance =
    linodesWithNotifications.filter(
      thisLinode => thisLinode.status !== 'stopped'
    ).length > 0;

  if (pendingMaintenance) {
    data.push(pendingMaintenanceItem());
  }

  return data;
};

const regionToNotificationItem = (region: Region) => {
  return {
    id: `status-item-${region.id}-outage`,
    body: (
      <Typography>
        We are experiencing an issue with our {dcDisplayNames[region.id]}{' '}
        datacenter. Please see our{' '}
        <Link to="https://status.linode.com">status page</Link> for more
        information.
      </Typography>
    )
  };
};

const inProgressMaintenanceToItem = (linode: LinodeWithNotification) => {
  return {
    id: `status-item-maintenance-${linode.id}`,
    body: (
      <Typography>
        <Link to={`/linodes/${linode.id}`}>{linode.label}&apos;s</Link> physical
        host is currently undergoing maintenance. During the maintenance, your
        Linode will be shut down
        {linode.notification?.label.match(/migrate/i)
          ? ', cold migrated to a new host, '
          : ' and remain offline, '}
        then returned to its last state (running or powered off). Please refer
        to
        <Link to="/support/tickets"> your Support tickets </Link> for more
        information.
      </Typography>
    )
  };
};

const pendingMaintenanceItem = () => {
  return {
    id: `status-item-maintenance-pending}`,
    body: (
      <Typography>
        Maintenance is required for one or more of your Linodes&apos; physical
        hosts. Your maintenance times will be listed under the
        &quot;Status&quot; column
        {!location.pathname.includes('/linodes') && (
          <Link to="/linodes?view=list"> here</Link>
        )}
        .
      </Typography>
    )
  };
};

export default useSystemStatusData;
