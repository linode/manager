import { Notification } from '@linode/api-v4/lib/account';
import {
  Config,
  LinodeBackups,
  LinodeStatus
} from '@linode/api-v4/lib/linodes';
import * as classNames from 'classnames';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Flag from 'src/assets/icons/flag.svg';
import Hidden from 'src/components/core/Hidden';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import HelpIcon from 'src/components/HelpIcon';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TagCell from 'src/components/TagCell';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import {
  linodeInTransition,
  transitionText
} from 'src/features/linodes/transitions';
import useLinodes from 'src/hooks/useLinodes';
import { capitalize } from 'src/utilities/capitalize';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import hasMutationAvailable, {
  HasMutationAvailable
} from '../hasMutationAvailable';
import IPAddress from '../IPAddress';
import LinodeActionMenu from '../LinodeActionMenu_CMR';
import RegionIndicator from '../RegionIndicator';
import { parseMaintenanceStartTime } from '../utils';
import withNotifications, { WithNotifications } from '../withNotifications';
import withRecentEvent, { WithRecentEvent } from '../withRecentEvent';
import LinodeRowBackupCell from './LinodeRowBackupCell_CMR';
import LinodeRowHeadCell from './LinodeRowHeadCell_CMR';
import styled, { StyleProps } from './LinodeRow_CMR.style';

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
  type: null | string;
  tags: string[];
  mostRecentBackup: string | null;
  openTagDrawer: (
    linodeID: number,
    linodeLabel: string,
    tags: string[]
  ) => void;
  openDeleteDialog: (linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  openLinodeResize: (linodeID: number) => void;
}

export type CombinedProps = Props &
  HasMutationAvailable &
  WithRecentEvent &
  WithNotifications &
  StyleProps;

export const LinodeRow: React.FC<CombinedProps> = props => {
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
    openTagDrawer,
    openDeleteDialog,
    openPowerActionDialog,
    openLinodeResize,
    // displayType, @todo use for M3-2059
    recentEvent,
    mutationAvailable
  } = props;

  const { updateLinode } = useLinodes();

  const loading = linodeInTransition(status, recentEvent);
  const dateTime = parseMaintenanceStartTime(maintenanceStartTime).split(' ');

  const { enqueueSnackbar } = useSnackbar();

  const addTag = React.useCallback(
    (tag: string) => {
      const newTags = [...tags, tag];
      updateLinode({ linodeId: id, tags: newTags }).catch(e =>
        enqueueSnackbar(getAPIErrorOrDefault(e, 'Error adding tag')[0].reason, {
          variant: 'error'
        })
      );
    },
    [tags, id, updateLinode, enqueueSnackbar]
  );

  const deleteTag = React.useCallback(
    (tag: string) => {
      const newTags = tags.filter(thisTag => thisTag !== tag);
      updateLinode({ linodeId: id, tags: newTags }).catch(e =>
        enqueueSnackbar(
          getAPIErrorOrDefault(e, 'Error deleting tag')[0].reason,
          {
            variant: 'error'
          }
        )
      );
    },
    [tags, id, updateLinode, enqueueSnackbar]
  );

  const MaintenanceText = () => {
    return (
      <>
        Please consult your{' '}
        <Link to="/support/tickets?type=open">support tickets</Link> for
        details.
      </>
    );
  };

  const StatusIcon = (
    <div
      className={classNames({
        [classes.statusIcon]: true,
        [classes.statusIconRunning]: status === 'running',
        [classes.statusIconOffline]: status === 'offline',
        [classes.statusIconOther]: status !== ('running' || 'offline')
      })}
    />
  );

  const headCell = (
    <LinodeRowHeadCell
      loading={loading}
      recentEvent={recentEvent}
      backups={backups}
      id={id}
      type={type}
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
      rowLink={`/linodes/${id}`}
      ariaLabel={label}
    >
      {headCell}
      <TableCell
        parentColumn="Status"
        className={classNames({
          [classes.statusCell]: true,
          [classes.statusCellMaintenance]: maintenanceStartTime
        })}
        data-qa-status
      >
        {!maintenanceStartTime ? (
          loading ? (
            recentEvent && (
              <>
                {StatusIcon}
                <ProgressDisplay
                  className={classes.progressDisplay}
                  progress={recentEvent.percent_complete}
                  text={transitionText(status, id, recentEvent)}
                />
              </>
            )
          ) : (
            <>
              {StatusIcon}
              {capitalize(displayStatus)}
            </>
          )
        ) : (
          <>
            <div>
              <div>
                <strong>Maintenance Scheduled</strong>
              </div>
              <div>
                {dateTime[0]} at {dateTime[1]}
              </div>
            </div>
            <HelpIcon
              text={<MaintenanceText />}
              className={classes.statusHelpIcon}
              tooltipPosition="top"
              interactive
            />
          </>
        )}
      </TableCell>
      <TableCell
        parentColumn="IP Address"
        className={classes.ipCell}
        data-qa-ips
      >
        <div className={classes.ipCellWrapper}>
          <IPAddress ips={ipv4} copyRight showCopyOnHover />
        </div>
      </TableCell>
      <TableCell
        parentColumn="Region"
        className={classes.regionCell}
        data-qa-region
      >
        <RegionIndicator region={region} />
      </TableCell>
      <LinodeRowBackupCell
        linodeId={id}
        backupsEnabled={backups.enabled || false}
        mostRecentBackup={mostRecentBackup || ''}
      />
      <Hidden mdDown>
        <TagCell
          tags={tags}
          addTag={addTag}
          deleteTag={deleteTag}
          listAllTags={() => openTagDrawer(id, label, tags)}
          width={300}
          inTableContext
        />
      </Hidden>

      <TableCell className={classes.actionCell} data-qa-notifications>
        <div className={classes.actionInner}>
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
            openDeleteDialog={openDeleteDialog}
            openPowerActionDialog={openPowerActionDialog}
            openLinodeResize={openLinodeResize}
            noImage={!image}
            inTableContext
          />
        </div>
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
}> = props => {
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

const ProgressDisplay: React.FC<{
  className?: string;
  progress: null | number;
  text: string;
}> = props => {
  const { progress, text, className } = props;
  const displayProgress = progress ? `${progress}%` : `scheduled`;

  return (
    <Typography variant="body2" className={className}>
      {text}:{' '}
      {displayProgress === 'scheduled' ? '(0%)' : `(${displayProgress})`}
    </Typography>
  );
};
