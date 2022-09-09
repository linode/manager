import { Notification } from '@linode/api-v4/lib/account';
import {
  Config,
  LinodeBackups,
  LinodeStatus,
} from '@linode/api-v4/lib/linodes';
import classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Flag from 'src/assets/icons/flag.svg';
import Hidden from 'src/components/core/Hidden';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import HelpIcon from 'src/components/HelpIcon';
import StatusIcon from 'src/components/StatusIcon';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import {
  getProgressOrDefault,
  linodeInTransition,
  transitionText,
} from 'src/features/linodes/transitions';
import { DialogType } from 'src/features/linodes/types';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import { capitalize, capitalizeAllWords } from 'src/utilities/capitalize';
import hasMutationAvailable, {
  HasMutationAvailable,
} from '../hasMutationAvailable';
import IPAddress from '../IPAddress';
import LinodeActionMenu from '../LinodeActionMenu';
import RegionIndicator from '../RegionIndicator';
import { parseMaintenanceStartTime } from '../utils';
import withNotifications, { WithNotifications } from '../withNotifications';
import withRecentEvent, { WithRecentEvent } from '../withRecentEvent';
import styled, { StyleProps } from './LinodeRow.style';
import LinodeRowBackupCell from './LinodeRowBackupCell';
import LinodeRowHeadCell from './LinodeRowHeadCell';

interface Props {
  backups: LinodeBackups;
  id: number;
  image: string | null;
  ipv4: string[];
  ipv6: string;
  label: string;
  maintenanceStartTime?: string | null;
  region: string;
  disk: number;
  memory: number;
  vcpus: number;
  status: LinodeStatus;
  displayStatus: string;
  type?: ExtendedType;
  tags: string[];
  mostRecentBackup: string | null;
  openDialog: (
    type: DialogType,
    linodeID: number,
    linodeLabel?: string
  ) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  openNotificationMenu: () => void;
}

export type CombinedProps = Props &
  HasMutationAvailable &
  WithRecentEvent &
  WithNotifications &
  StyleProps;

export const LinodeRow: React.FC<CombinedProps> = (props) => {
  const {
    // linode props
    backups,
    id,
    ipv4,
    ipv6,
    maintenanceStartTime,
    label,
    region,
    status,
    displayStatus,
    mostRecentBackup,
    disk,
    vcpus,
    memory,
    type,
    tags,
    image,
    // other props
    classes,
    linodeNotifications,
    openDialog,
    openPowerActionDialog,
    openNotificationMenu,
    recentEvent,
    mutationAvailable,
  } = props;

  const isBareMetalInstance = type?.class === 'metal';

  const loading = linodeInTransition(status, recentEvent);
  const parsedMaintenanceStartTime = parseMaintenanceStartTime(
    maintenanceStartTime
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

  const headCell = (
    <LinodeRowHeadCell
      loading={loading}
      recentEvent={recentEvent}
      backups={backups}
      id={id}
      ipv4={ipv4}
      ipv6={ipv6}
      label={label}
      region={region}
      status={status}
      displayStatus={displayStatus}
      tags={tags}
      mostRecentBackup={mostRecentBackup}
      disk={disk}
      vcpus={vcpus}
      memory={memory}
      image={image}
      maintenance={maintenanceStartTime}
    />
  );

  return (
    <TableRow
      key={id}
      className={classes.bodyRow}
      data-qa-loading
      data-qa-linode={label}
      ariaLabel={label}
    >
      {headCell}
      <TableCell
        className={classNames({
          [classes.statusCell]: true,
          [classes.statusCellMaintenance]: maintenanceStartTime,
        })}
        statusCell
        data-qa-status
      >
        {!maintenanceStartTime ? (
          loading ? (
            <>
              <StatusIcon status={iconStatus} />
              <button
                className={classes.statusLink}
                onClick={() => openNotificationMenu()}
              >
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
              {displayStatus.includes('_')
                ? capitalizeAllWords(displayStatus.replace('_', ' '))
                : capitalize(displayStatus)}
            </>
          )
        ) : (
          <div className={classes.maintenanceOuter}>
            <strong>Maintenance Scheduled</strong>
            <HelpIcon
              text={<MaintenanceText />}
              tooltipPosition="top"
              interactive
              classes={{ tooltip: classes.maintenanceTooltip }}
            />
          </div>
        )}
      </TableCell>

      <Hidden xsDown>
        <TableCell className={classes.planCell} data-qa-ips>
          <div className={classes.planCell}>{type?.label}</div>
        </TableCell>
        <TableCell className={classes.ipCell} data-qa-ips>
          <div className={classes.ipCellWrapper}>
            <IPAddress ips={ipv4} />
          </div>
        </TableCell>
        <Hidden mdDown>
          <TableCell className={classes.regionCell} data-qa-region>
            <RegionIndicator region={region} />
          </TableCell>
        </Hidden>
      </Hidden>
      <Hidden mdDown>
        <LinodeRowBackupCell
          linodeId={id}
          backupsEnabled={backups.enabled || false}
          mostRecentBackup={mostRecentBackup || ''}
          isBareMetalInstance={isBareMetalInstance}
        />
      </Hidden>

      <TableCell actionCell data-qa-notifications>
        <RenderFlag
          mutationAvailable={mutationAvailable}
          linodeNotifications={linodeNotifications}
          classes={classes}
        />
        <LinodeActionMenu
          linodeId={id}
          linodeLabel={label}
          linodeRegion={region}
          linodeType={type}
          linodeStatus={status}
          linodeBackups={backups}
          openDialog={openDialog}
          openPowerActionDialog={openPowerActionDialog}
          inListView
        />
      </TableCell>
    </TableRow>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withRecentEvent,
  hasMutationAvailable,
  withNotifications,
  styled,
  React.memo
);

export default enhanced(LinodeRow);

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
  progress: null | number;
  text: string | undefined;
}> = (props) => {
  const { progress, text, className } = props;
  const displayProgress = progress ? `${progress}%` : `scheduled`;

  return (
    <Typography variant="body1" className={className}>
      {text} {displayProgress === 'scheduled' ? '(0%)' : `(${displayProgress})`}
    </Typography>
  );
};
