import { useRegionQuery } from '@linode/queries';
import { Paper, Stack, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { MaintenancePolicySelect } from 'src/components/MaintenancePolicySelect/MaintenancePolicySelect';

import type { LinodeCreateFormValues } from '../utilities';
import type { MaintenancePolicyId } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';

export const MaintenancePolicy = () => {
  const { control, watch } = useFormContext<LinodeCreateFormValues>();

  const selectedRegion = watch('region');
  const { data: region } = useRegionQuery(selectedRegion);

  const regionSupportsMaintenancePolicy =
    region?.capabilities.includes('Maintenance Policy') ?? false;

  if (!regionSupportsMaintenancePolicy) return null;

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Host Maintenance Policy</Typography>
        <Typography>
          Set the preferred host maintenance policy for this Linode. During host
          maintenance events (such as host upgrades), this policy setting helps
          determine which maintenance method is performed.{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/host-maintenance-policy">
            Learn more
          </Link>
          .
        </Typography>
        <Controller
          control={control}
          name="maintenance_policy_id"
          render={({ field, fieldState }) => (
            <MaintenancePolicySelect
              errorText={fieldState.error?.message}
              onChange={(_, item: SelectOption<MaintenancePolicyId>) => {
                field.onChange(item?.value);
              }}
              sx={(theme) => ({
                [theme.breakpoints.up('md')]: {
                  minWidth: '480px',
                },
              })}
              textFieldProps={{
                expand: true,
                sx: {
                  width: '468px',
                },
              }}
              value={field.value as MaintenancePolicyId}
            />
          )}
        />
      </Stack>
    </Paper>
  );
};
