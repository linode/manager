import { AccountMaintenance } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { useProfile } from 'src/queries/profile';
import { formatDate } from 'src/utilities/formatDate';
import isPast from 'src/utilities/isPast';

type ClassNames = 'root' | 'dateTime';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      '& p': {
        lineHeight: `20px`,
      },
      '& p:last-child': {
        marginBottom: 0,
      },
    },
    dateTime: {
      fontSize: theme.spacing(2),
      lineHeight: `${theme.spacing(2.5)}px`,
    },
  });

interface Props {
  /** please keep in mind here that it's possible the start time can be in the past */
  maintenanceStart?: string | null;
  maintenanceEnd?: string | null;
  type?: AccountMaintenance['type'];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const MaintenanceBanner: React.FC<CombinedProps> = (props) => {
  const { type, maintenanceEnd, maintenanceStart } = props;
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile();

  const timezoneMsg = () => {
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

  return (
    <Notice warning important className={props.classes.root}>
      <Typography>
        {generateIntroText(type, maintenanceStart, maintenanceEnd)}
      </Typography>
      {
        /** only display timezone on the Linode detail */
        maintenanceStart && (
          <Typography>
            Timezone: <Link to="/profile/display">{timezoneMsg()} </Link>
          </Typography>
        )
      }
      <Typography>
        For more information, please see your{' '}
        <Link to="/support/tickets?type=open">open support tickets.</Link>
      </Typography>
    </Notice>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  React.memo
)(MaintenanceBanner);

const generateIntroText = (
  type?: AccountMaintenance['type'],
  start?: string | null,
  end?: string | null
) => {
  const maintenanceInProgress = !!start
    ? isPast(start)(new Date().toISOString())
    : false;

  /** we're on the Linode Detail Screen */
  if (!!type) {
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
    if (!!start) {
      /**
       * we're going to display both the raw and humanized versions of the date
       * to the user here.
       */
      const rawDate = formatDate(start);

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
