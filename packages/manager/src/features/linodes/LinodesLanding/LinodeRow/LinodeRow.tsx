import { Notification } from '@linode/api-v4/lib/account';
import { Linode } from '@linode/api-v4/lib/linodes';
import classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Flag from 'src/assets/icons/flag.svg';
import Hidden from 'src/components/core/Hidden';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import {
  getProgressOrDefault,
  linodeInTransition,
  transitionText,
} from 'src/features/linodes/transitions';
import { capitalizeAllWords } from 'src/utilities/capitalize';
import IPAddress from '../IPAddress';
import LinodeActionMenu from '../LinodeActionMenu';
import RegionIndicator from '../RegionIndicator';
import { parseMaintenanceStartTime } from '../utils';
import { SxProps } from '@mui/system';
import { useNotificationsQuery } from 'src/queries/accountNotifications';
import { LinodeHandlers } from '../LinodesLanding';
import { useTypeQuery } from 'src/queries/types';
import useEvents from 'src/hooks/useEvents';
import { useStyles } from './LinodeRow.style';
import { useAllAccountMaintenanceQuery } from 'src/queries/accountMaintenance';
import { useNotificationContext } from 'src/features/NotificationCenter/NotificationContext';
import { BackupStatus } from 'src/components/BackupStatus/BackupStatus';

type Props = Linode & { handlers: LinodeHandlers };

export const LinodeRow = (props: Props) => {
  const classes = useStyles();
  const { backups, id, ipv4, label, region, status, type, handlers } = props;

  const { openMenu } = useNotificationContext();

  const { data: notifications } = useNotificationsQuery();

  const { data: accountMaintenanceData } = useAllAccountMaintenanceQuery(
    {},
    { status: { '+or': ['pending, started'] } }
  );

  const maintenance = accountMaintenanceData?.find(
    (m) => m.entity.id === id && m.entity.type === 'linode'
  );

  const linodeNotifications =
    notifications?.filter(
      (notification) =>
        notification.entity?.type === 'linode' && notification.entity?.id === id
    ) ?? [];

  const { data: linodeType } = useTypeQuery(type);

  const { events } = useEvents();

  const recentEvent = events.find(
    (e) => e.entity?.id === id && e.entity.type === 'linode'
  );

  const isBareMetalInstance = linodeType?.class === 'metal';

  const loading = linodeInTransition(status, recentEvent);

  const parsedMaintenanceStartTime = parseMaintenanceStartTime(
    maintenance?.when
  );

  const MaintenanceText = () => {
    return (
      <>
        This Linode&rsquo;s maintenance window opens at{' '}
        {parsedMaintenanceStartTime}. For more information, see your{' '}
        <Link className={classes.statusLink} to="/support/tickets?type=open">
          open support tickets.
        </Link>
      </>
    );
  };

  const iconStatus =
    status === 'running'
      ? 'active'
      : ['offline', 'stopped'].includes(status)
      ? 'inactive'
      : 'other';

  return (
    <TableRow
      key={id}
      className={classes.bodyRow}
      data-qa-loading
      data-qa-linode={label}
      ariaLabel={label}
    >
      <TableCell>
        <Link to={`/linodes/${id}`} tabIndex={0}>
          {label}
        </Link>
      </TableCell>
      <TableCell
        className={classNames({
          [classes.statusCell]: true,
          [classes.statusCellMaintenance]: Boolean(maintenance),
        })}
        statusCell
        data-qa-status
      >
        {!Boolean(maintenance) ? (
          loading ? (
            <>
              <StatusIcon status={iconStatus} />
              <button className={classes.statusLink} onClick={() => openMenu()}>
                <ProgressDisplay
                  className={classes.progressDisplay}
                  progress={getProgressOrDefault(recentEvent)}
                  text={transitionText(status, id, recentEvent)}
                />
              </button>
            </>
          ) : (
            <>
              <StatusIcon status={iconStatus} />
              {capitalizeAllWords(status.replace('_', ' '))}
            </>
          )
        ) : (
          <div className={classes.maintenanceOuter}>
            <strong>Maintenance Scheduled</strong>
            <TooltipIcon
              status="help"
              text={<MaintenanceText />}
              tooltipPosition="top"
              interactive
              classes={{ tooltip: classes.maintenanceTooltip }}
            />
          </div>
        )}
      </TableCell>

      <Hidden smDown>
        <TableCell className={classes.planCell} data-qa-ips>
          <div className={classes.planCell}>{linodeType?.label}</div>
        </TableCell>
        <TableCell className={classes.ipCell} data-qa-ips>
          <div className={classes.ipCellWrapper}>
            <IPAddress ips={ipv4} />
          </div>
        </TableCell>
        <Hidden lgDown>
          <TableCell className={classes.regionCell} data-qa-region>
            <RegionIndicator region={region} />
          </TableCell>
        </Hidden>
      </Hidden>
      <Hidden lgDown>
        <TableCell>
          <BackupStatus
            linodeId={id}
            backupsEnabled={backups.enabled}
            mostRecentBackup={backups.last_successful}
            isBareMetalInstance={isBareMetalInstance}
          />
        </TableCell>
      </Hidden>
      <TableCell actionCell data-qa-notifications>
        <RenderFlag
          mutationAvailable={
            linodeType !== undefined && linodeType?.successor !== null
          }
          linodeNotifications={linodeNotifications}
          classes={classes}
        />
        <LinodeActionMenu
          linodeId={id}
          linodeLabel={label}
          linodeRegion={region}
          linodeType={linodeType}
          linodeStatus={status}
          linodeBackups={backups}
          {...handlers}
          inListView
        />
      </TableCell>
    </TableRow>
  );
};

export const RenderFlag: React.FC<{
  mutationAvailable: boolean;
  linodeNotifications: Notification[];
  classes: any;
}> = (props) => {
  /*
   * Render either a flag for if the Linode has a notification
   * or if it has a pending mutation available. Mutations take
   * precedent over notifications
   */
  const { mutationAvailable, linodeNotifications, classes } = props;

  if (mutationAvailable) {
    return (
      <Tooltip title="There is a free upgrade available for this Linode">
        <Flag className={classes.flag} />
      </Tooltip>
    );
  }
  if (linodeNotifications.length > 0) {
    return (
      // eslint-disable-next-line
      <>
        {linodeNotifications.map((notification, idx) => (
          <Tooltip key={idx} title={notification.message}>
            <Flag className={classes.flag} />
          </Tooltip>
        ))}
      </>
    );
  }
  return null;
};

RenderFlag.displayName = `RenderFlag`;

export const ProgressDisplay: React.FC<{
  className?: string;
  sx?: SxProps;
  progress: null | number;
  text: string | undefined;
}> = (props) => {
  const { progress, text, className, sx } = props;
  const displayProgress = progress ? `${progress}%` : `scheduled`;

  return (
    <Typography variant="body1" className={className} sx={sx}>
      {text} {displayProgress === 'scheduled' ? '(0%)' : `(${displayProgress})`}
    </Typography>
  );
};
