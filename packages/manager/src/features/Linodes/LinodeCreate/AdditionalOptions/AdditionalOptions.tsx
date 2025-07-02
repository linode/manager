import { useRegionsQuery } from '@linode/queries';
import { Divider, Paper, Stack, Typography } from '@linode/ui';
import { isAclpSupportedRegion } from '@linode/utilities';
import React from 'react';
import { useWatch } from 'react-hook-form';

import { useVMHostMaintenanceEnabled } from 'src/features/Account/utils';
import { MaintenancePolicy } from 'src/features/Linodes/LinodeCreate/AdditionalOptions/MaintenancePolicy';
import { useFlags } from 'src/hooks/useFlags';

import { Alerts } from './Alerts/Alerts';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const AdditionalOptions = ({
  isAclpAlertsBetaCreateFlow,
  setIsAclpAlertsBetaCreateFlow,
}: {
  isAclpAlertsBetaCreateFlow: boolean;
  setIsAclpAlertsBetaCreateFlow: (value: boolean) => void;
}) => {
  const { aclpBetaServices } = useFlags();
  const { data: regions } = useRegionsQuery();
  const { isVMHostMaintenanceEnabled } = useVMHostMaintenanceEnabled();

  const selectedRegionId = useWatch<CreateLinodeRequest, 'region'>({
    name: 'region',
  });

  const isAclpAlertsSupportedRegionLinode = isAclpSupportedRegion({
    capability: 'Linodes',
    regionId: selectedRegionId,
    regions,
    type: 'alerts',
  });

  const showAlerts =
    aclpBetaServices?.linode?.alerts && isAclpAlertsSupportedRegionLinode;

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
            isAclpAlertsBetaCreateFlow={isAclpAlertsBetaCreateFlow}
            setIsAclpAlertsBetaCreateFlow={setIsAclpAlertsBetaCreateFlow}
          />
        )}
        {isVMHostMaintenanceEnabled && <MaintenancePolicy />}
      </Stack>
    </Paper>
  );
};
