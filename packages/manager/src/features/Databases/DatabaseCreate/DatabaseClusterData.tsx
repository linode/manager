import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import { Divider, Typography } from '@linode/ui';
import { getCapabilityFromPlanType } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import {
  StyledLabelTooltip,
  StyledTextField,
} from 'src/features/Databases/DatabaseCreate/DatabaseCreate.style';
import { DatabaseEngineSelect } from 'src/features/Databases/DatabaseCreate/DatabaseEngineSelect';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import type { DatabaseCreateValues } from './DatabaseCreate';
import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';

interface Props {
  selectedPlan?: PlanSelectionWithDatabaseType;
}

const labelToolTip = (
  <StyledLabelTooltip>
    <strong>Label must:</strong>
    <ul>
      <li>Begin with an alpha character</li>
      <li>Contain only alpha characters or single hyphens</li>
      <li>Be between 3 - 32 characters</li>
    </ul>
  </StyledLabelTooltip>
);

export const DatabaseClusterData = (props: Props) => {
  const { selectedPlan } = props;
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });
  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  const { data: regionsData } = useRegionsQuery();

  const { control, setValue, reset, getValues } =
    useFormContext<DatabaseCreateValues>();

  const resetVPCConfiguration = () => {
    reset({
      ...getValues(),
      private_network: {
        vpc_id: null,
        subnet_id: null,
        public_access: false,
      },
    });
  };

  const handleRegionChange = (value: string) => {
    setValue('region', value);

    // When the selected region has changed, reset VPC configuration
    resetVPCConfiguration();

    // Validate plan selection
    if (flags.databasePremium && selectedPlan) {
      const newRegion = regionsData?.find((region) => region.id === value);

      const isPlanAvailableInRegion = Boolean(
        newRegion?.capabilities.includes(
          getCapabilityFromPlanType(selectedPlan.class)
        )
      );
      // Clear plan selection if plan is not available in the selected region
      if (!isPlanAvailableInRegion) {
        setValue('type', '');
      }
    }
  };

  return (
    <>
      <Grid>
        <Typography variant="h2">Name Your Cluster</Typography>
        <Controller
          control={control}
          name="label"
          render={({ field, fieldState }) => (
            <StyledTextField
              data-qa-label-input
              disabled={isRestricted}
              errorText={fieldState.error?.message}
              label="Cluster Label"
              onChange={field.onChange}
              tooltipText={labelToolTip}
              value={field.value}
            />
          )}
        />
      </Grid>
      <Divider spacingBottom={12} spacingTop={38} />
      <Grid>
        <Typography variant="h2">Select Engine and Region</Typography>
        <DatabaseEngineSelect />
      </Grid>
      <Grid>
        <Controller
          control={control}
          name="region"
          render={({ field, fieldState }) => (
            <RegionSelect
              currentCapability="Managed Databases"
              disableClearable
              disabled={isRestricted}
              errorText={fieldState.error?.message}
              isGeckoLAEnabled={isGeckoLAEnabled}
              onChange={(e, region) => handleRegionChange(region.id)}
              regions={regionsData ?? []}
              value={field.value ?? undefined}
            />
          )}
        />
        <RegionHelperText mt={1} />
      </Grid>
    </>
  );
};
