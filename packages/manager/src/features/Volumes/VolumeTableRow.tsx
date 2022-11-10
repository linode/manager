import { Event } from '@linode/api-v4/lib/account';
import { Status } from 'src/components/StatusIcon/StatusIcon';
import * as React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { compose } from 'recompose';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import StatusIcon from 'src/components/StatusIcon';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { formatRegion } from 'src/utilities';
import { ExtendedVolume } from './types';
import VolumesActionMenu, { ActionHandlers } from './VolumesActionMenu';
import SupportLink from 'src/components/SupportLink';
import useNotifications from 'src/hooks/useNotifications';
import useEvents from 'src/hooks/useEvents';
import { Volume } from '@linode/api-v4/lib/volumes/types';

export const useStyles = makeStyles({
  volumePath: {
    width: '35%',
    wordBreak: 'break-all',
  },
  chipWrapper: {
    alignSelf: 'center',
  },
});

export type CombinedProps = Volume & ActionHandlers;

export const progressFromEvent = (e?: Event) => {
  if (!e) {
    return undefined;
  }

  if (e.status === 'started' && e.percent_complete) {
    return e.percent_complete;
  }

  return undefined;
};

export const isVolumeUpdating = (e?: Event) => {
  // Make Typescript happy, since this function can otherwise technically return undefined
  if (!e) {
    return false;
  }
  return (
    e &&
    ['volume_attach', 'volume_detach', 'volume_create'].includes(e.action) &&
    ['scheduled', 'started'].includes(e.status)
  );
};

export const volumeStatusIconMap: Record<ExtendedVolume['status'], Status> = {
  active: 'active',
  resizing: 'other',
  migrating: 'other',
  creating: 'other',
  contact_support: 'error',
  deleting: 'other',
  deleted: 'inactive',
};

export const VolumeTableRow: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const {
    openForClone,
    openForConfig,
    openForEdit,
    openForResize,
    handleAttach,
    handleDelete,
    handleDetach,
    handleUpgrade,
    id,
    label,
    status,
    tags,
    size,
    region,
    hardware_type: hardwareType,
    filesystem_path: filesystemPath,
    linode_label,
    linode_id: linodeId,
  } = props;

  const history = useHistory();
  const location = useLocation();
  const isVolumesLanding = Boolean(location.pathname.match(/volumes/));
  const notifications = useNotifications();
  const { events } = useEvents();

  const formattedRegion = formatRegion(region);

  const eligibleForUpgradeToNVMe = notifications.some(
    (notification) =>
      notification.type === 'volume_migration_scheduled' &&
      notification.entity?.id === id
  );

  const nvmeUpgradeScheduledByUserImminent = notifications.some(
    (notification) =>
      notification.type === 'volume_migration_imminent' &&
      notification.entity?.id === id
  );

  const nvmeUpgradeScheduledByUserInProgress = events.some(
    (event) =>
      event.action === 'volume_migrate' &&
      event.entity?.id === id &&
      event.status === 'started'
  );

  // const recentEvent = events.find((event) => event.entity?.id === id);

  // Use this to show a progress bar
  // const isUpdating = isVolumeUpdating(recentEvent);
  // const progress = progressFromEvent(recentEvent);

  const volumeStatusMap: Record<
    ExtendedVolume['status'],
    string | JSX.Element
  > = {
    active: 'Active',
    resizing: 'Resizing',
    creating: 'Creating',
    contact_support: (
      <SupportLink text="Contact Support" entity={{ type: 'volume_id', id }} />
    ),
    deleting: 'Deleting',
    deleted: 'Deleted',
    migrating: 'Migrating',
  };

  const isNVMe = hardwareType === 'nvme';

  return (
    <TableRow key={`volume-row-${id}`} data-qa-volume-cell={id}>
      <TableCell data-qa-volume-cell-label={label}>
        <Grid
          container
          wrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
        >
          {isVolumesLanding ? (
            <>
              <Grid item>
                <div>{label}</div>
                {/* {isUpdating && <LinearProgress value={progress} />} */}
              </Grid>
              {isNVMe ? (
                <Grid item className={classes.chipWrapper}>
                  <Chip
                    variant="outlined"
                    outlineColor="green"
                    label="NVMe"
                    data-testid="nvme-chip"
                    size="small"
                  />
                </Grid>
              ) : eligibleForUpgradeToNVMe &&
                !nvmeUpgradeScheduledByUserImminent ? (
                <Grid item className={classes.chipWrapper}>
                  <Chip
                    label="UPGRADE TO NVMe"
                    onClick={
                      linodeId
                        ? () => history.push(`/linodes/${linodeId}/upgrade`)
                        : () => handleUpgrade?.(id, label)
                    }
                    data-testid="upgrade-chip"
                    size="small"
                    clickable
                  />
                </Grid>
              ) : nvmeUpgradeScheduledByUserImminent ||
                nvmeUpgradeScheduledByUserInProgress ? (
                <Grid item className={classes.chipWrapper}>
                  <Chip
                    variant="outlined"
                    outlineColor="gray"
                    label="UPGRADE PENDING"
                    data-testid="upgrading-chip"
                    size="small"
                  />
                </Grid>
              ) : null}
            </>
          ) : (
            <Grid item>
              <div>{label}</div>
            </Grid>
          )}
        </Grid>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={volumeStatusIconMap[status]} />
        {volumeStatusMap[status]}
      </TableCell>
      {isVolumesLanding && region ? (
        <TableCell data-qa-volume-region noWrap>
          {formattedRegion}
        </TableCell>
      ) : null}
      <TableCell data-qa-volume-size>{size} GB</TableCell>
      {!isVolumesLanding ? (
        <Hidden xsDown>
          <TableCell className={classes.volumePath} data-qa-fs-path>
            {filesystemPath}
          </TableCell>
        </Hidden>
      ) : null}
      {isVolumesLanding && (
        <TableCell data-qa-volume-cell-attachment={linode_label}>
          {linodeId ? (
            <Link to={`/linodes/${linodeId}`} className="link secondaryLink">
              {linode_label}
            </Link>
          ) : (
            <Typography data-qa-unattached>Unattached</Typography>
          )}
        </TableCell>
      )}
      <TableCell actionCell>
        <VolumesActionMenu
          openForConfig={openForConfig}
          filesystemPath={filesystemPath}
          linodeLabel={linode_label || ''}
          linodeId={linodeId ?? 0}
          regionID={region}
          volumeId={id}
          volumeTags={tags}
          size={size}
          label={label}
          openForEdit={openForEdit}
          openForResize={openForResize}
          openForClone={openForClone}
          volumeLabel={label}
          /**
           * This is a safer check than linode_id (see logic in addAttachedLinodeInfoToVolume() from VolumesLanding)
           * as it actually checks to see if the Linode exists before adding linodeLabel and linodeStatus.
           * This avoids a bug (M3-2534) where a Volume attached to a just-deleted Linode
           * could sometimes get tagged as "attached" here.
           */
          attached={Boolean(linode_label)}
          isVolumesLanding={isVolumesLanding} // Passing this down to govern logic re: showing Attach or Detach in action menu.
          handleAttach={handleAttach}
          handleDetach={handleDetach}
          handleDelete={handleDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default compose<CombinedProps, ActionHandlers & ExtendedVolume>(
  React.memo
)(VolumeTableRow);
