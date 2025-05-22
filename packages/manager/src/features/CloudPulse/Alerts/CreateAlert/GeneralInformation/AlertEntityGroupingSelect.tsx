import { Autocomplete } from '@linode/ui';
import React from 'react';
import {
  Controller,
  type FieldPathByValue,
  useFormContext,
} from 'react-hook-form';

import { entityGroupingOptions } from '../../constants';

import type { CreateAlertDefinitionForm } from '../types';
import type { AlertDefinitionGroup } from '@linode/api-v4';

interface AlertEntityGroupingSelectProps {
  disabled?: boolean;
  name: FieldPathByValue<
    CreateAlertDefinitionForm,
    AlertDefinitionGroup | null
  >;
}

export const AlertEntityGroupingSelect = (
  props: AlertEntityGroupingSelectProps
) => {
  const { name, disabled } = props;
  const { control, setValue } = useFormContext<CreateAlertDefinitionForm>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Autocomplete
          data-testid="entity-grouping"
          disableClearable
          disabled={disabled}
          errorText={fieldState.error?.message}
          label="Scope"
          onBlur={field.onBlur}
          onChange={(_, { value }) => {
            if (value) {
              field.onChange(value);
            }

            setValue('regions', value === 'per-region' ? [] : undefined);
            setValue('entity_ids', value === 'per-entity' ? [] : undefined);
          }}
          options={entityGroupingOptions}
          placeholder="Select a grouping"
          size="medium"
          value={
            field.value !== null
              ? entityGroupingOptions.find(({ value }) => value === field.value)
              : entityGroupingOptions[0]
          }
        />
      )}
    />
  );
};
