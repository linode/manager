import { useRegionQuery } from '@linode/queries';
import { Accordion, BetaChip, Notice } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Link } from 'src/components/Link';
import {
  GPU_PLAN_NOTICE,
  MAINTENANCE_POLICY_DESCRIPTION,
  MAINTENANCE_POLICY_LEARN_MORE_URL,
  MAINTENANCE_POLICY_NOT_AVAILABLE_IN_REGION_TEXT,
  MAINTENANCE_POLICY_TITLE,
} from 'src/components/MaintenancePolicySelect/constants';
import { MaintenancePolicySelect } from 'src/components/MaintenancePolicySelect/MaintenancePolicySelect';
import { useVMHostMaintenanceEnabled } from 'src/features/Account/utils';
import { useTypeQuery } from 'src/queries/types';

import type { LinodeCreateFormValues } from '../utilities';

export const MaintenancePolicy = () => {
  const { control } = useFormContext<LinodeCreateFormValues>();
  const { isVMHostMaintenanceEnabled } = useVMHostMaintenanceEnabled();

  const [selectedRegion, selectedType] = useWatch({
    control,
    name: ['region', 'type'],
  });

  const { data: region } = useRegionQuery(selectedRegion);
  const { data: type } = useTypeQuery(selectedType, Boolean(selectedType));

  const isGPUPlan = type && type.class === 'gpu';

  const regionSupportsMaintenancePolicy =
    region?.capabilities.includes('Maintenance Policy') ?? false;

  const showHelperText = selectedRegion && !regionSupportsMaintenancePolicy;

  return (
    <Accordion
      detailProps={{ sx: { p: 0 } }}
      heading={MAINTENANCE_POLICY_TITLE}
      headingChip={isVMHostMaintenanceEnabled ? <BetaChip /> : undefined}
      subHeading={
        <>
          {MAINTENANCE_POLICY_DESCRIPTION}{' '}
          <Link to={MAINTENANCE_POLICY_LEARN_MORE_URL}>Learn more</Link>.
        </>
      }
      summaryProps={{ sx: { p: 0 } }}
      sx={{
        '&.Mui-expanded': {
          marginTop: 0,
        },
      }}
    >
      {regionSupportsMaintenancePolicy && isGPUPlan && (
        <Notice variant="warning">{GPU_PLAN_NOTICE}</Notice>
      )}
      <Controller
        control={control}
        name="maintenance_policy_id"
        render={({ field, fieldState }) => (
          <MaintenancePolicySelect
            disabled={!selectedRegion || !regionSupportsMaintenancePolicy}
            errorText={fieldState.error?.message}
            onChange={(_, item) => {
              field.onChange(item.value);
            }}
            textFieldProps={{
              helperText: showHelperText
                ? MAINTENANCE_POLICY_NOT_AVAILABLE_IN_REGION_TEXT
                : undefined,
            }}
            value={field.value ?? undefined}
          />
        )}
      />
    </Accordion>
  );
};
