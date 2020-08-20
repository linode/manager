import { Region } from '@linode/api-v4/lib/regions/types';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import { dcDisplayNames } from 'src/constants';
import useLinodes from 'src/hooks/useLinodes';
import useNotifications from 'src/hooks/useNotifications';
import useRegions from 'src/hooks/useRegions';
import {
  addNotificationsToLinodes,
  LinodeWithMaintenance
} from 'src/store/linodes/linodes.helpers';
import { NotificationItem } from '../NotificationSection';

export const useSystemStatusData = (): NotificationItem[] => {
  const { linodes } = useLinodes();
  const { entities: regions } = useRegions();
  const notifications = useNotifications();

  const linodesWithNotifications = addNotificationsToLinodes(
    notifications,
    Object.values(linodes.itemsById)
  );

  const linodeRegions = Object.values(linodes.itemsById).map(
    thisLinode => thisLinode.region
  );

  const regionsWithOutages = regions.filter(
    thisRegion =>
      thisRegion.status === 'outage' && linodeRegions.includes(thisRegion.id)
  );

  const outages = regionsWithOutages.map(regionToNotificationItem);
  const maintenance = linodesWithNotifications.map(
    maintenanceToNotificationItem
  );
  return [...outages, ...maintenance];
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

const maintenanceToNotificationItem = (linode: LinodeWithMaintenance) => {
  const maintenanceInProgress = linode.status === 'stopped';

  return {
    id: `status-item-maintenance-${linode.id}`,
    body: maintenanceInProgress ? (
      <Typography>
        <Link to={`/linodes/${linode.id}`}>{linode.label}&apos;s</Link> physical
        host is currently undergoing maintenance. During the maintenance, your
        Linode will be shut down
        {linode.maintenance?.type.match(/migrate/i)
          ? ', cold migrated to a new host, '
          : ' and remain offline, '}
        then returned to its last state (running or powered off). Please refer
        to
        <Link to="/support/tickets"> your Support tickets </Link> for more
        information.
      </Typography>
    ) : (
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
