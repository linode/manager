import * as React from 'react';
import { compose } from 'recompose';
import Flag from 'src/assets/icons/flag.svg';
import Tooltip from 'src/components/core/Tooltip';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { linodeInTransition } from 'src/features/linodes/transitions';
import hasMutationAvailable, {
  HasMutationAvailable
} from '../hasMutationAvailable';
import IPAddress from '../IPAddress';
import LinodeActionMenu from '../LinodeActionMenu';
import RegionIndicator from '../RegionIndicator';
import withNotifications, { WithNotifications } from '../withNotifications';
import withRecentEvent, { WithRecentEvent } from '../withRecentEvent';
import styled, { StyleProps } from './LinodeRow.style';
import LinodeRowBackupCell from './LinodeRowBackupCell';
import LinodeRowHeadCell from './LinodeRowHeadCell';
import LinodeRowLoading from './LinodeRowLoading';

import { parseMaintenanceStartTime } from '../utils';

interface Props {
  backups: Linode.LinodeBackups;
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
  status: Linode.LinodeStatus;
  type: null | string;
  tags: string[];
  mostRecentBackup: string | null;
  someLinodesHaveMaintenance: boolean;

  openConfigDrawer: (
    configs: Linode.Config[],
    action: LinodeConfigSelectionDrawerCallback
  ) => void;
  toggleConfirmation: (
    bootOption: Linode.BootAction,
    linodeId: number,
    linodeLabel: string
  ) => void;
}

export type CombinedProps = Props &
  HasMutationAvailable &
  WithRecentEvent &
  WithNotifications &
  StyleProps;

export const LinodeRow: React.StatelessComponent<CombinedProps> = props => {
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
    tags,
    mostRecentBackup,
    disk,
    vcpus,
    memory,
    type,
    image,
    // other props
    classes,
    linodeNotifications,
    openConfigDrawer,
    toggleConfirmation,
    // displayType, @todo use for M3-2059
    recentEvent,
    mutationAvailable
  } = props;

  const loading = linodeInTransition(status, recentEvent);

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
      tags={tags}
      mostRecentBackup={mostRecentBackup}
      disk={disk}
      vcpus={vcpus}
      memory={memory}
      image={image}
    />
  );

  return (
    <React.Fragment>
      {loading && (
        <LinodeRowLoading
          linodeStatus={status}
          linodeId={id}
          linodeRecentEvent={recentEvent}
        >
          {headCell}
        </LinodeRowLoading>
      )}
      <TableRow
        key={id}
        className={classes.bodyRow}
        data-qa-loading
        data-qa-linode={label}
        rowLink={`/linodes/${id}`}
        aria-label={label}
      >
        {!loading && headCell}
        <LinodeRowBackupCell
          linodeId={id}
          backupsEnabled={backups.enabled || false}
          mostRecentBackup={mostRecentBackup || ''}
        />
        <TableCell
          parentColumn="IP Address"
          className={classes.ipCell}
          data-qa-ips
        >
          <div className={classes.ipCellWrapper}>
            <IPAddress ips={ipv4} copyRight showCopyOnHover />
          </div>
        </TableCell>
        {props.someLinodesHaveMaintenance && (
          <TableCell
            parentColumn="Maintenance Status"
            className={classes.regionCell}
            data-qa-maintenance-status
          >
            {parseMaintenanceStartTime(maintenanceStartTime)}
          </TableCell>
        )}
        <TableCell
          parentColumn="Region"
          className={classes.regionCell}
          data-qa-region
        >
          <RegionIndicator region={region} />
        </TableCell>
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
              openConfigDrawer={openConfigDrawer}
              toggleConfirmation={toggleConfirmation}
              noImage={!image}
            />
          </div>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withRecentEvent,
  hasMutationAvailable,
  withNotifications,
  styled
);

export default enhanced(LinodeRow);

export const RenderFlag: React.StatelessComponent<{
  mutationAvailable: boolean;
  linodeNotifications: Linode.Notification[];
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
