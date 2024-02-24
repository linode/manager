import * as React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { Box } from 'src/components/Box';
import { Chip } from 'src/components/Chip';
import { Hidden } from 'src/components/Hidden';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Status } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useNotificationsQuery } from 'src/queries/accountNotifications';
import { useInProgressEvents } from 'src/queries/events/events';
import { useRegionsQuery } from 'src/queries/regions';

import { ActionHandlers, VolumesActionMenu } from './VolumesActionMenu';

import type { Event, Volume } from '@linode/api-v4';

export const useStyles = makeStyles()({
  volumePath: {
    width: '35%',
    wordBreak: 'break-all',
  },
});

interface Props {
  handlers: ActionHandlers;
  isDetailsPageRow?: boolean;
  volume: Volume;
}

export const volumeStatusIconMap: Record<Volume['status'], Status> = {
  active: 'active',
  creating: 'other',
  migrating: 'other',
  offline: 'inactive',
  resizing: 'other',
};

/**
 * Given an in-progress event and a volume's status, this function
 * returns a volume's status with event info taken into account.
 *
 * We do this to provide users with a real-time feeling experience
 * without having to refetch a volume's status agressivly.
 *
 * @param status The actual volume status from the volumes endpoint
 * @param event An in-progress event for the volume
 * @returns a volume status
 */
export const getDerivedVolumeStatusFromStatusAndEvent = (
  status: Volume['status'],
  event: Event | undefined
): Volume['status'] => {
  if (event === undefined) {
    return status;
  }

  if (event.action === 'volume_migrate' && event.status === 'started') {
    return 'migrating';
  }

  return status;
};

/**
 * Returns a nicely formated percentage from an event
 * only if the event is in progress and has a percentage.
 *
 * This allows us to show the user the progress of a
 * volume migration.
 *
 * @returns "(50%)" for example
 */
export const getEventProgress = (event: Event | undefined) => {
  if (
    event === undefined ||
    event.percent_complete === null ||
    event.status !== 'started'
  ) {
    return null;
  }

  return `(${event.percent_complete}%)`;
};

export const VolumeTableRow = React.memo((props: Props) => {
  const { classes } = useStyles();
  const { handlers, isDetailsPageRow, volume } = props;

  const history = useHistory();

  const { data: regions } = useRegionsQuery();
  const { data: notifications } = useNotificationsQuery();
  const { data: inProgressEvents } = useInProgressEvents();

  const isVolumesLanding = !isDetailsPageRow;

  /**
   * Once a migration is scheduled by Linode and eligible for an upgrade,
   * the customer will receive a `volume_migration_scheduled` notification
   */
  const isEligibleForUpgradeToNVMe = notifications?.some(
    (notification) =>
      notification.type === 'volume_migration_scheduled' &&
      notification.entity?.id === volume.id
  );

  /**
   * Once a migration's scheduled date has passed, the customer will receive
   * a `volume_migration_imminent` notification instead of the `volume_migration_scheduled` notification.
   *
   * This means that the migration will start when it gets picked up by a backend worker.
   * The volume's status is set to `migrating` and a `volume_migrate` event is created.
   */
  const isNVMeUpgradeImminent = notifications?.some(
    (notification) =>
      notification.type === 'volume_migration_imminent' &&
      notification.entity?.id === volume.id
  );

  const mostRecentVolumeEvent = inProgressEvents?.find(
    (event) => event.entity?.id === volume.id && event.entity.type === 'volume'
  );

  const volumeStatus = getDerivedVolumeStatusFromStatusAndEvent(
    volume.status,
    mostRecentVolumeEvent
  );

  const isVolumeMigrating = volumeStatus === 'migrating';

  const handleUpgrade = () => {
    if (volume.linode_id !== null) {
      // If the volume is attached to a Linode, we force the user
      // to upgrade all of the Linode's volumes at once.
      // I don't like this, but this is how UX wanted it when this was first built.
      history.push(`/linodes/${volume.linode_id}/storage?upgrade=true`);
    } else {
      handlers.handleUpgrade();
    }
  };

  const regionLabel =
    regions?.find((r) => r.id === volume.region)?.label ?? volume.region;

  return (
    <TableRow data-qa-volume-cell={volume.id} key={`volume-row-${volume.id}`}>
      <TableCell data-qa-volume-cell-label={volume.label}>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            wrap: 'nowrap',
          }}
        >
          {volume.label}
          {isEligibleForUpgradeToNVMe && (
            <Chip
              clickable
              label="UPGRADE TO NVMe"
              onClick={handleUpgrade}
              size="small"
            />
          )}
          {isNVMeUpgradeImminent && !isVolumeMigrating && (
            <Chip color="default" label="UPGRADE PENDING" size="small" />
          )}
        </Box>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={volumeStatusIconMap[volumeStatus]} />
        {volumeStatus} {getEventProgress(mostRecentVolumeEvent)}
      </TableCell>
      {isVolumesLanding && (
        <TableCell data-qa-volume-region data-testid="region" noWrap>
          {regionLabel}
        </TableCell>
      )}
      <TableCell data-qa-volume-size>{volume.size} GB</TableCell>
      {!isVolumesLanding && (
        <Hidden smDown>
          <TableCell className={classes.volumePath} data-qa-fs-path>
            {volume.filesystem_path}
          </TableCell>
        </Hidden>
      )}
      {isVolumesLanding && (
        <TableCell data-qa-volume-cell-attachment={volume.linode_label}>
          {volume.linode_id !== null ? (
            <Link
              className="link secondaryLink"
              to={`/linodes/${volume.linode_id}/storage`}
            >
              {volume.linode_label}
            </Link>
          ) : (
            <Typography data-qa-unattached>Unattached</Typography>
          )}
        </TableCell>
      )}
      <TableCell actionCell>
        <VolumesActionMenu
          handlers={handlers}
          isVolumesLanding={isVolumesLanding} // Passing this down to govern logic re: showing Attach or Detach in action menu.
          volume={volume}
        />
      </TableCell>
    </TableRow>
  );
});
