import { Autocomplete } from '@linode/ui';
import React from 'react';
import {
  Controller,
  type FieldPathByValue,
  useFormContext,
} from 'react-hook-form';

import {
  ALERT_SCOPE_TOOLTIP_TEXT,
  entityGroupingOptions,
} from '../../constants';

import type { CreateAlertDefinitionForm } from '../types';
import type { AlertDefinitionGroup } from '@linode/api-v4';

interface AlertEntityScopeSelectProps {
  name: FieldPathByValue<
    CreateAlertDefinitionForm,
    AlertDefinitionGroup | null
  >;
}

export const AlertEntityScopeSelect = (props: AlertEntityScopeSelectProps) => {
  const { name } = props;
  const { control, setValue } = useFormContext<CreateAlertDefinitionForm>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Autocomplete
          data-testid="entity-grouping"
          disableClearable
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
          placeholder="Select a scope"
          size="medium"
          textFieldProps={{
            labelTooltipText: ALERT_SCOPE_TOOLTIP_TEXT,
          }}
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
