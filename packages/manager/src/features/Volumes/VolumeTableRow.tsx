import { useNotificationsQuery, useRegionsQuery } from '@linode/queries';
import { Box, Chip, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { getFormattedStatus } from '@linode/utilities';
import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { useHistory } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useInProgressEvents } from 'src/queries/events/events';

import { HighPerformanceVolumeIcon } from '../Linodes/HighPerformanceVolumeIcon';
import {
  getDerivedVolumeStatusFromStatusAndEvent,
  getEventProgress,
  volumeStatusIconMap,
} from './utils';
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
      // to upgrade all of the Linode's volumes at once from the Linode details page
      history.push(`/linodes/${volume.linode_id}/storage?upgrade=true`);
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
          <Box
            sx={(theme) => ({
              alignItems: 'center',
              display: 'flex',
              gap: theme.spacing(),
            })}
          >
            {volume.label}
            {linodeCapabilities && (
              <HighPerformanceVolumeIcon
                linodeCapabilities={linodeCapabilities}
              />
            )}
          </Box>

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
        {getFormattedStatus(volumeStatus)}
        {getEventProgress(mostRecentVolumeEvent)}
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
