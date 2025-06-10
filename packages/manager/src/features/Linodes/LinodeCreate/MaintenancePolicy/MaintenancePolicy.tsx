import { useRegionQuery } from '@linode/queries';
import { BetaChip, Notice, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Link } from 'src/components/Link';
import {
  GPU_PLAN_NOTICE,
  MAINTENANCE_POLICY_DESCRIPTION,
  MAINTENANCE_POLICY_LEARN_MORE_URL,
  MAINTENANCE_POLICY_TITLE,
} from 'src/components/MaintenancePolicySelect/constants';
import { MaintenancePolicySelect } from 'src/components/MaintenancePolicySelect/MaintenancePolicySelect';
import { useFlags } from 'src/hooks/useFlags';
import { useTypeQuery } from 'src/queries/types';

import type { LinodeCreateFormValues } from '../utilities';
import type { MaintenancePolicyId } from '@linode/api-v4';

export const MaintenancePolicy = () => {
  const { control } = useFormContext<LinodeCreateFormValues>();

  const [selectedRegion, selectedType] = useWatch({
    control,
    name: ['region', 'type'],
  });

  const { data: region } = useRegionQuery(selectedRegion);
  const { data: type } = useTypeQuery(selectedType, Boolean(selectedType));

  const flags = useFlags();

  const isGPUPlan = type && type.class === 'gpu';

  const regionSupportsMaintenancePolicy =
    region?.capabilities.includes('Maintenance Policy') ?? false;

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">
          {MAINTENANCE_POLICY_TITLE}{' '}
          {flags.vmHostMaintenance?.beta && <BetaChip />}
        </Typography>
        <Typography>
          {MAINTENANCE_POLICY_DESCRIPTION}{' '}
          <Link to={MAINTENANCE_POLICY_LEARN_MORE_URL}>Learn more</Link>.
        </Typography>
        {regionSupportsMaintenancePolicy && isGPUPlan && (
          <Notice variant="warning">{GPU_PLAN_NOTICE}</Notice>
        )}
        <Controller
          control={control}
          name="maintenance_policy_id"
          render={({ field, fieldState }) => (
            <MaintenancePolicySelect
              disabled={!regionSupportsMaintenancePolicy}
              errorText={fieldState.error?.message}
              onChange={(_, item) => {
                field.onChange(item.value);
              }}
              textFieldProps={{
                helperText: !regionSupportsMaintenancePolicy
                  ? 'Maintenance policy is not available in the selected region.'
                  : undefined,
              }}
              value={field.value as MaintenancePolicyId}
            />
          )}
        />
      </Stack>
    </Paper>
  );
};
