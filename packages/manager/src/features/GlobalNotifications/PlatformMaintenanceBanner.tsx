import { useLinodeQuery } from '@linode/queries';
import { Box, Button, Notice, Stack, Typography } from '@linode/ui';
import React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { usePlatformMaintenance } from 'src/hooks/usePlatformMaintenance';

import { Link } from '../../components/Link';
import { PowerActionsDialog } from '../Linodes/PowerActionsDialogOrDrawer';

import type { AccountMaintenance, Linode } from '@linode/api-v4';

/**
 * This banner will be used in the event of VM platform maintenance,
 * that requires a reboot, e.g., QEMU upgrades. Since these are
 * urgent and affect a large portion of Linodes, we are displaying
 * them separately from the standard MaintenanceBanner.
 */

export const PlatformMaintenanceBanner = () => {
  const { accountHasPlatformMaintenance, linodesWithPlatformMaintenance } =
    usePlatformMaintenance();

  if (!accountHasPlatformMaintenance) return null;

  return (
    <Notice variant="warning">
      <Typography>
        <strong>
          {linodesWithPlatformMaintenance.size > 0
            ? linodesWithPlatformMaintenance.size
            : 'One or more'}{' '}
          Linode{linodesWithPlatformMaintenance.size !== 1 && 's'}
        </strong>{' '}
        need{linodesWithPlatformMaintenance.size === 1 && 's'} to be rebooted
        for critical platform maintenance. See which Linodes are scheduled for
        reboot on the <Link to="/account/maintenance">Account Maintenance</Link>{' '}
        page.
      </Typography>
    </Notice>
  );
};

export const LinodePlatformMaintenanceBanner = (props: {
  linodeId: Linode['id'];
}) => {
  const { linodeId } = props;

  const { linodesWithPlatformMaintenance, platformMaintenanceByLinode } =
    usePlatformMaintenance();

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined
  );

  const [isRebootDialogOpen, setIsRebootDialogOpen] = React.useState(false);

  if (linodeId === undefined || !linodesWithPlatformMaintenance.has(linodeId))
    return null;

  const earliestMaintenance = platformMaintenanceByLinode[linodeId].reduce(
    (earliest, current) => {
      const currentMaintenanceStartTime = getMaintenanceStartTime(current);
      const earliestMaintenanceStartTime = getMaintenanceStartTime(earliest);

      if (currentMaintenanceStartTime && earliestMaintenanceStartTime) {
        return currentMaintenanceStartTime < earliestMaintenanceStartTime
          ? current
          : earliest;
      }

      return earliest;
    },
    platformMaintenanceByLinode[linodeId][0]
  );

  const startTime = getMaintenanceStartTime(earliestMaintenance);

  return (
    <>
      <Notice forceImportantIconVerticalCenter variant="warning">
        <Stack alignItems="center" direction="row">
          <Box flex={1}>
            <Typography>
              Linode{' '}
              <Link to={`/linodes/${linodeId}`}>
                {linode?.label ?? linodeId}
              </Link>{' '}
              needs to be rebooted for critical platform maintenance.{' '}
              {startTime && (
                <>
                  A reboot is scheduled for{' '}
                  <strong>
                    <DateTimeDisplay
                      format="MM/dd/yyyy"
                      sx={(theme) => ({
                        fontWeight: theme.tokens.font.FontWeight.Bold,
                      })}
                      value={startTime}
                    />{' '}
                    at{' '}
                    <DateTimeDisplay
                      format="HH:mm"
                      sx={(theme) => ({
                        fontWeight: theme.tokens.font.FontWeight.Bold,
                      })}
                      value={startTime}
                    />
                  </strong>
                  .
                </>
              )}
            </Typography>
          </Box>
          <Button
            buttonType="primary"
            disabled={linode?.status === 'rebooting'}
            onClick={() => setIsRebootDialogOpen(true)}
            tooltipText={
              linode?.status === 'rebooting'
                ? 'This Linode is currently rebooting.'
                : undefined
            }
          >
            Reboot Now
          </Button>
        </Stack>
      </Notice>
      <PowerActionsDialog
        action="Reboot"
        isOpen={isRebootDialogOpen}
        linodeId={linodeId}
        onClose={() => setIsRebootDialogOpen(false)}
      />
    </>
  );
};

// The 'start_time' field might not be available, so fallback to 'when'
const getMaintenanceStartTime = (
  maintenance: AccountMaintenance
): null | string | undefined => maintenance.start_time ?? maintenance.when;
