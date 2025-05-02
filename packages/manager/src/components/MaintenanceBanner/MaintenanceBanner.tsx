import { useAllAccountMaintenanceQuery, useProfile } from '@linode/queries';
import { Notice, Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { PENDING_MAINTENANCE_FILTER } from 'src/features/Account/Maintenance/utilities';
import { formatDate } from 'src/utilities/formatDate';
import { isPast } from 'src/utilities/isPast';

import type { AccountMaintenance } from '@linode/api-v4/lib/account';

interface Props {
  maintenanceEnd?: null | string;
  /** please keep in mind here that it's possible the start time can be in the past */
  maintenanceStart?: null | string;
  type?: AccountMaintenance['type'];
}

export const MaintenanceBanner = React.memo((props: Props) => {
  const { maintenanceEnd, maintenanceStart, type } = props;

  const { data: accountMaintenanceData } = useAllAccountMaintenanceQuery(
    {},
    PENDING_MAINTENANCE_FILTER
  );

  const {
    data: profile,
    error: profileError,
    isLoading: profileLoading,
  } = useProfile();

  const getTimezoneMessage = () => {
    if (profileLoading) {
      return 'Fetching timezone...';
    }

    if (profileError) {
      return 'Error retrieving timezone.';
    }

    if (!profile?.timezone) {
      return null;
    }

    return profile.timezone;
  };

  /**
   * don't display a banner if there is no start time.
   *
   * This case will happen when there's a Linode with no MQueue record
   * but has a pending manual migration.
   *
   * In other words, it's an edge case, and we don't need to worry about
   * informing the user of anything in this case.
   *
   * IMPORTANT NOTE: if maintenanceStart is "undefined", it means we're on
   * either the dashboard or Linodes Landing, so in this case, we don't want to
   * return null
   */
  if (maintenanceStart === null) {
    return null;
  }

  if (!accountMaintenanceData || accountMaintenanceData?.length === 0) {
    return null;
  }

  return (
    <Notice variant="warning">
      <Typography lineHeight="20px">
        {generateIntroText(type, maintenanceStart, maintenanceEnd)}
      </Typography>
      {
        /** only display timezone on the Linode detail */
        maintenanceStart && (
          <Typography lineHeight="20px">
            Timezone: <Link to="/profile/display">{getTimezoneMessage()} </Link>
          </Typography>
        )
      }
      <Typography lineHeight="20px">
        For more information, please see your{' '}
        <Link to="/support/tickets?type=open">open support tickets.</Link>
      </Typography>
    </Notice>
  );
});

const generateIntroText = (
  type?: AccountMaintenance['type'],
  start?: null | string,
  end?: null | string,
  timezone?: string
) => {
  const maintenanceInProgress = start
    ? isPast(start)(new Date().toISOString())
    : false;

  /** we're on the Linode Detail Screen */
  if (type) {
    if (maintenanceInProgress) {
      return (
        <React.Fragment>
          This Linode&rsquo;s physical host is currently undergoing maintenance.{' '}
          {maintenanceActionTextMap[type]} Please refer to
          <Link to="/support/tickets"> your Support tickets </Link> for more
          information.
        </React.Fragment>
      );
    }

    /** migration or reboot happening at a later date */
    if (start) {
      /**
       * we're going to display both the raw and humanized versions of the date
       * to the user here.
       */
      const rawDate = formatDate(start, {
        timezone,
      });

      return (
        <React.Fragment>
          This Linode&rsquo;s physical host will be undergoing maintenance at{' '}
          {rawDate}
          {'. '}
          {maintenanceActionTextMap[type]}
        </React.Fragment>
      );
    } else {
      /**
       * for some reason, we don't have a _when_ property from the notification.
       * In other words, we have no idea when their maintenance time starts. This can happen
       * when the user has a manual migration pending - only a small amount of users are going
       * to see this.
       *
       * do not show any text in this case
       */
      return null;
    }
  }

  /** We are on the Dashboard or Linode Landing page. */
  return (
    <React.Fragment>
      Maintenance is required for one or more of your Linodes&rsquo; physical
      hosts. Your maintenance times will be listed under the &quot;Status&quot;
      column
      {!location.pathname.includes('/linodes') && (
        <Link to="/linodes?view=list"> here</Link>
      )}
      .
    </React.Fragment>
  );
};

export const maintenanceActionTextMap: Record<
  AccountMaintenance['type'],
  string
> = {
  cold_migration:
    'During this time, your Linode will be shut down, cold migrated to a new host, then returned to its last state (running or powered off).',
  live_migration:
    'During this time, your Linode will be live migrated to a new host, then returned to its last state (running or powered off).',
  reboot:
    'During this time, your Linode will be shut down and remain offline, then returned to its last state (running or powered off).',
  volume_migration:
    'During this time, your Linode will be shut down and upgraded, then returned to its last state (running or powered off).',
};
