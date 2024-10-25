// import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { Box } from 'src/components/Box';
import { Chip } from 'src/components/Chip';
import { Hidden } from 'src/components/Hidden';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { useNotificationsQuery } from 'src/queries/account/notifications';
import { useInProgressEvents } from 'src/queries/events/events';
import { useRegionsQuery } from 'src/queries/regions/regions';

import {
  getDerivedVolumeStatusFromStatusAndEvent,
  getEventProgress,
  volumeStatusIconMap,
} from './utils';
import { VolumesActionMenu } from './VolumesActionMenu';

import type { ActionHandlers } from './VolumesActionMenu';
import type { Volume } from '@linode/api-v4';

export const useStyles = makeStyles()({
  volumePath: {
    width: '35%',
    wordBreak: 'break-all',
  },
});

interface Props {
  handlers: ActionHandlers;
  isBlockStorageEncryptionFeatureEnabled?: boolean;
  isDetailsPageRow?: boolean;
  volume: Volume;
}

export const VolumeTableRow = React.memo((props: Props) => {
  const { classes } = useStyles();
  // const navigate = useNavigate();
  const history = useHistory();
  const {
    handlers,
    isBlockStorageEncryptionFeatureEnabled,
    isDetailsPageRow,
    volume,
  } = props;

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
      // to upgrade all of the Linode's volumes at once from the Linode details page

      history.push(`/linodes/${volume.linode_id}/storage?upgrade=true`);
      // TODO: Tanstack Router - update hook
      // navigate({
      //   params: { linodeId: volume.linode_id },
      //   search: { upgrade: 'true' },
      //   to: '/linodes/$linodeId/storage',
      // });
    } else {
      handlers.handleUpgrade();
    }
  };

  const regionLabel =
    regions?.find((r) => r.id === volume.region)?.label ?? volume.region;

  const encryptionStatus =
    volume.encryption === 'enabled' ? 'Encrypted' : 'Not Encrypted';

  return (
    <TableRow data-qa-volume-cell={volume.id} key={`volume-row-${volume.id}`}>
      <TableCell data-qa-volume-cell-label={volume.label}>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            gap: 2,
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
        <Hidden xsDown>
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
      {isBlockStorageEncryptionFeatureEnabled && (
        <TableCell noWrap>{encryptionStatus}</TableCell>
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
