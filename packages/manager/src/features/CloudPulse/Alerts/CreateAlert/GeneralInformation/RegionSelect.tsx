import { useRegionsQuery } from '@linode/queries';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';

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
