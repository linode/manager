import {
  FormError,
  FormField,
  FormLabel,
  Icon,
  TextField,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import { getCapabilityFromPlanType } from '@linode/utilities';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { DatabaseEngineSelect } from 'src/features/Databases/DatabaseCreate/DatabaseEngineSelect';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import { Divider } from '../shared/Divider/Divider';

import type { DatabaseCreateValues } from './DatabaseCreate';
import type { PlanSelectionWithDatabaseType } from 'src/features/components/PlansPanel/types';

interface Props {
  selectedPlan?: PlanSelectionWithDatabaseType;
}

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
      <div>
        <h3 style={{ marginTop: 0, marginBottom: Spacing.S8 }}>
          Name Your Cluster
        </h3>
        <Controller
          control={control}
          name="label"
          render={({ field, fieldState }) => (
            <FormField
              error={Boolean(fieldState.error)}
              labelPosition="top"
              style={{ maxWidth: 444 }}
            >
              <FormLabel htmlFor="label-field" slot="label">
                Cluster Label
              </FormLabel>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <TextField
                  data-qa-label-input
                  disabled={isRestricted}
                  error={Boolean(fieldState.error)}
                  id="label-field"
                  onChange={field.onChange}
                  style={{
                    marginRight: Spacing.S8,
                    padding: `0 ${Spacing.S12}`,
                  }}
                  value={field.value}
                />

                <Tooltip tooltipText="Label must begin with an alpha character, contain only alpha characters or single hyphens, and be between 3-32 characters.">
                  <Icon
                    color="primary"
                    data-qa-label-tooltip
                    icon="info-outline"
                    size="m"
                  />
                </Tooltip>
              </div>
              {fieldState.error?.message && (
                <FormError slot="error">{fieldState.error.message}</FormError>
              )}
            </FormField>
          )}
        />
      </div>
      <Divider marginBottom={Spacing.S12} marginTop={Spacing.S24} />
      <div>
        <h3>Select Engine and Region</h3>
        <DatabaseEngineSelect />
      </div>
      <div>
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
      </div>
    </>
  );
};
