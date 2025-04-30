import { Autocomplete } from '@linode/ui';
import React from 'react';
import {
  Controller,
  type FieldPathByValue,
  useFormContext,
} from 'react-hook-form';

import { entityGroupingOptions } from '../../constants';

import type { CreateAlertDefinitionForm } from '../types';
import type { AlertDefinitionType } from '@linode/api-v4';

interface AlertEntityGroupingSelectProps {
  name: FieldPathByValue<CreateAlertDefinitionForm, AlertDefinitionType | null>;
}

export const AlertEntityGroupingSelect = (
  props: AlertEntityGroupingSelectProps
) => {
  const { name } = props;
  const { control } = useFormContext<CreateAlertDefinitionForm>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Autocomplete
          data-testid="entity-grouping"
          errorText={fieldState.error?.message}
          label="Entity Grouping"
          onBlur={field.onBlur}
          onChange={(
            _,
            selected: { label: string; value: AlertDefinitionType },
            reason
          ) => {
            if (selected) {
              field.onChange(selected.value);
            }
            if (reason === 'clear') {
              field.onChange(null);
            }
          }}
          options={entityGroupingOptions}
          placeholder="Select an entity grouping"
          size="medium"
          textFieldProps={{
            labelTooltipText:
              'Define a severity level associated with the alert to help you prioritize and manage alerts in the Recent activity tab.',
          }}
          value={
            field.value !== null
              ? entityGroupingOptions.find(
                  (option) => option.value === field.value
                )
              : entityGroupingOptions[0]
          }
        />
      )}
    />
  );
};
