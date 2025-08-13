import { Divider, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useWatch } from 'react-hook-form';

import { useVMHostMaintenanceEnabled } from 'src/features/Account/utils';
import { useIsAclpSupportedRegion } from 'src/features/CloudPulse/Utils/utils';
import { useFlags } from 'src/hooks/useFlags';

import { Alerts } from './Alerts';
import { MaintenancePolicy } from './MaintenancePolicy';

import type { CreateLinodeRequest } from '@linode/api-v4';

interface AdditionalOptionProps {
  isAlertsBetaMode: boolean;
  onAlertsModeChange: (isBeta: boolean) => void;
}

export const AdditionalOptions = ({
  onAlertsModeChange,
  isAlertsBetaMode,
}: AdditionalOptionProps) => {
  const { aclpServices } = useFlags();
  const { isVMHostMaintenanceEnabled } = useVMHostMaintenanceEnabled();

  const selectedRegionId = useWatch<CreateLinodeRequest, 'region'>({
    name: 'region',
  });

  const isAclpAlertsSupportedRegionLinode = useIsAclpSupportedRegion({
    capability: 'Linodes',
    regionId: selectedRegionId,
    type: 'alerts',
  });

  const showAlerts =
    aclpServices?.linode?.alerts?.enabled && isAclpAlertsSupportedRegionLinode;

  const hideAdditionalOptions = !showAlerts && !isVMHostMaintenanceEnabled;

  if (hideAdditionalOptions) {
    return null;
  }

  return (
    <Paper>
      <Typography
        sx={(theme) => ({ mb: theme.spacingFunction(16) })}
        variant="h2"
      >
        Additional Options
      </Typography>
      <Stack divider={<Divider />}>
        {showAlerts && (
          <Alerts
            isAlertsBetaMode={isAlertsBetaMode}
            onAlertsModeChange={onAlertsModeChange}
          />
        )}
        {isVMHostMaintenanceEnabled && <MaintenancePolicy />}
      </Stack>
    </Paper>
  );
};
