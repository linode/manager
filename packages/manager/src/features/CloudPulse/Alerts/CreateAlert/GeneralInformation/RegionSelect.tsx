import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { useFlags } from 'src/hooks/useFlags';

import type { CreateAlertDefinitionForm } from '../types';
import type { FieldPathByValue } from 'react-hook-form';

export interface CloudViewRegionSelectProps {
  /**
   * name used for the component to set in the form
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, string>;
}

export const CloudPulseRegionSelect = (props: CloudViewRegionSelectProps) => {
  const { name } = props;
  const { data: regions, isError, isLoading } = useRegionsQuery();
  const { control } = useFormContext<CreateAlertDefinitionForm>();
  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  return (
    <Controller
      render={({ field, fieldState }) => (
        <RegionSelect
          errorText={
            fieldState.error?.message ??
            (isError ? 'Failed to fetch Region.' : '')
          }
          onChange={(_, value) => {
            field.onChange(value?.id);
          }}
          currentCapability={undefined}
          fullWidth
          isGeckoLAEnabled={isGeckoLAEnabled}
          label="Region"
          loading={isLoading}
          placeholder="Select a Region"
          regions={regions ?? []}
          textFieldProps={{ onBlur: field.onBlur }}
          value={field.value}
        />
      )}
      control={control}
      name={name}
    />
  );
};
