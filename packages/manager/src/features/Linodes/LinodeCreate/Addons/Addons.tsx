import { useRegionsQuery } from '@linode/queries';
import { Divider, Notice, Paper, Stack, Typography } from '@linode/ui';
import React, { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { Backups } from './Backups';
import { PrivateIP } from './PrivateIP';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const Addons = () => {
  const { setValue } = useFormContext<CreateLinodeRequest>();
  const [regionId, interfaceGeneration] = useWatch<
    CreateLinodeRequest,
    ['region', 'interface_generation']
  >({ name: ['region', 'interface_generation'] });

  const { data: regions } = useRegionsQuery();

  const selectedRegion = useMemo(
    () => regions?.find((r) => r.id === regionId),
    [regions, regionId]
  );

  const isDistributedRegionSelected =
    selectedRegion?.site_type === 'distributed';

  const shouldShowPrivateIP = interfaceGeneration !== 'linode';

  // Clean up private IP value when the option is hidden
  if (!shouldShowPrivateIP) {
    setValue('private_ip', false);
  }

  return (
    <Paper data-qa-add-ons>
      <Stack spacing={2}>
        <Typography variant="h2">Add-ons</Typography>
        {isDistributedRegionSelected && (
          <Notice
            text="Backups and Private IP are not available for distributed regions."
            variant="warning"
          />
        )}
        <Stack divider={<Divider />} spacing={2}>
          <Backups />
          {shouldShowPrivateIP && <PrivateIP />}
        </Stack>
      </Stack>
    </Paper>
  );
};
