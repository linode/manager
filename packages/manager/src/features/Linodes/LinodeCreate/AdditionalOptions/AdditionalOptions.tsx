import { useRegionsQuery } from '@linode/queries';
import { Paper, Typography } from '@linode/ui';
import { isAclpSupportedRegion } from '@linode/utilities';
import React from 'react';
import { useWatch } from 'react-hook-form';

import { useFlags } from 'src/hooks/useFlags';

import { Alerts } from './Alerts/Alerts';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const AdditionalOptions = () => {
  const flags = useFlags();
  const { data: regions } = useRegionsQuery();

  const selectedRegionId = useWatch<CreateLinodeRequest, 'region'>({
    name: 'region',
  });

  const isAclpAlertsSupportedRegionLinode = isAclpSupportedRegion({
    type: 'alerts',
    capability: 'Linodes',
    regions,
    regionId: selectedRegionId,
  });

  const isAlertsEnabled =
    flags.aclpBetaServices?.alerts && isAclpAlertsSupportedRegionLinode;

  const hideAdditionalOptions = !isAlertsEnabled;

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
      <Alerts />
    </Paper>
  );
};
