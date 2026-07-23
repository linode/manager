import { TableCell, TableRow } from '@akamai/cds-components/react/Table';
import { getFormattedStatus } from '@akamai/compute-ui-core/api';
import { useNotificationsQuery, useRegionsQuery } from '@linode/queries';
import { Box, Chip } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { useInProgressEvents } from 'src/queries/events/events';

import { HighPerformanceVolumeIcon } from '../../Linodes/HighPerformanceVolumeIcon';
import {
  getDerivedVolumeStatusFromStatusAndEvent,
  getEventProgress,
  volumeStatusIconMap,
} from '../utils';
import { AttachedToValue } from './AttachedToValue';
import { VolumesActionMenu } from './VolumesActionMenu';

import type { ActionHandlers } from './VolumesActionMenu';
import type { LinodeCapabilities, Volume } from '@linode/api-v4';

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
  linodeCapabilities?: LinodeCapabilities[];
  volume: Volume;
}

export const VolumeTableRow = React.memo((props: Props) => {
  const { classes } = useStyles();
  const {
    handlers,
    isBlockStorageEncryptionFeatureEnabled,
    isDetailsPageRow,
    linodeCapabilities,
    volume,
  } = props;

  const navigate = useNavigate();

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
      navigate({
        to: '/linodes/$linodeId/storage',
        params: {
          linodeId: volume.linode_id,
        },
        search: { upgrade: true },
      });
    } else {
      handlers.handleUpgrade();
    }
  };

  const regionLabel =
    regions?.find((r) => r.id === volume.region)?.label ?? volume.region;

  const encryptionStatus =
    volume.encryption === 'enabled' ? 'Encrypted' : 'Not Encrypted';

  return (
    <TableRow
      data-qa-volume-cell={volume.id}
      hoverable
      key={`volume-row-${volume.id}`}
      zebra
    >
      <TableCell
        data-qa-volume-cell-label={volume.label}
        style={{ flex: '0 1 25%' }}
      >
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            gap: 2,
            justifyContent: 'space-between',
            wrap: 'nowrap',
          }}
        >
          <Link to={`/volumes/${volume.id}`}>
            <Box
              sx={(theme) => ({
                alignItems: 'center',
                display: 'flex',
                gap: theme.spacingFunction(8),
              })}
            >
              {volume.label}
              {linodeCapabilities && (
                <HighPerformanceVolumeIcon
                  linodeCapabilities={linodeCapabilities}
                />
              )}
            </Box>
          </Link>

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

      <TableCell style={{ flex: '0 1 12%' }}>
        <StatusIcon status={volumeStatusIconMap[volumeStatus]} />
        {getFormattedStatus(volumeStatus)}{' '}
        {getEventProgress(mostRecentVolumeEvent)}
      </TableCell>

      {isVolumesLanding && (
        <TableCell
          data-qa-volume-region
          data-testid="region"
          style={{ textWrap: 'nowrap' }}
        >
          {regionLabel}
        </TableCell>
      )}

      <TableCell data-qa-volume-size style={{ flex: '0 1 12%' }}>
        {volume.size} GB
      </TableCell>

      {!isVolumesLanding && (
        <Hidden xsDown>
          <TableCell className={classes.volumePath} data-qa-fs-path>
            {volume.filesystem_path}
          </TableCell>
        </Hidden>
      )}

      {isVolumesLanding && (
        <TableCell
          data-qa-volume-cell-attachment={volume.linode_label}
          style={{ flex: '0 1 15%' }}
        >
          <AttachedToValue volume={volume} />
        </TableCell>
      )}

      {isBlockStorageEncryptionFeatureEnabled && (
        <TableCell style={{ textWrap: 'nowrap', flex: '0 1 15%' }}>
          {encryptionStatus}
        </TableCell>
      )}

      <TableCell style={{ maxWidth: 40 }}>
        <VolumesActionMenu
          handlers={handlers}
          isVolumesLanding={isVolumesLanding} // Passing this down to govern logic re: showing Attach or Detach in action menu.
          volume={volume}
        />
      </TableCell>
    </TableRow>
  );
});
