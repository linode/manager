import { useLinodeQuery } from '@linode/queries';
import { Notice } from '@linode/ui';
import { Box, Button, Stack, Typography } from '@linode/ui';
import { useLocation } from '@tanstack/react-router';
import React from 'react';

import { PowerActionsDialog } from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import { usePlatformMaintenance } from 'src/hooks/usePlatformMaintenance';

import { DateTimeDisplay } from '../DateTimeDisplay';
import { Link } from '../Link';

import type { AccountMaintenance, Linode } from '@linode/api-v4';

export const LinodePlatformMaintenanceBanner = (props: {
  linodeId: Linode['id'];
}) => {
  const { linodeId } = props;
  const location = useLocation();

  const { linodesWithPlatformMaintenance, platformMaintenanceByLinode } =
    usePlatformMaintenance();

  const { data: linode } = useLinodeQuery(
    linodeId,
    linodesWithPlatformMaintenance.has(linodeId)
  );

  const [isRebootDialogOpen, setIsRebootDialogOpen] = React.useState(false);

  if (!linodesWithPlatformMaintenance.has(linodeId)) return null;

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

  const hideLinodeLink = location.pathname === `/linodes/${linodeId}`;

  return (
    <>
      <Notice
        data-testid="linode-platform-maintenance-banner"
        forceImportantIconVerticalCenter
        variant="warning"
      >
        <Stack alignItems="center" direction="row" gap={1}>
          <Box flex={1}>
            <Typography>
              Linode{' '}
              {hideLinodeLink ? (
                `${linode?.label ?? linodeId}`
              ) : (
                <Link to={`/linodes/${linodeId}`}>
                  {linode?.label ?? linodeId}
                </Link>
              )}{' '}
              needs to be rebooted for critical platform maintenance.{' '}
              {startTime && (
                <>
                  A reboot is scheduled for{' '}
                  <strong>
                    <DateTimeDisplay
                      format="MM/dd/yyyy"
                      sx={(theme) => ({
                        font: theme.font.bold,
                      })}
                      value={startTime}
                    />{' '}
                    at{' '}
                    <DateTimeDisplay
                      format="HH:mm"
                      sx={(theme) => ({
                        font: theme.font.bold,
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
