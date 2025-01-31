import { Autocomplete } from '@linode/ui';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { alertSeverityOptions } from '../../constants';

import type { CreateAlertDefinitionForm } from '../types';
import type { AlertSeverityType } from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';
export interface CloudPulseAlertSeveritySelectProps {
  /**
   * name used for the component in the form
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, AlertSeverityType | null>;
}

export const CloudPulseAlertSeveritySelect = (
  props: CloudPulseAlertSeveritySelectProps
) => {
  const { name } = props;
  const { control } = useFormContext<CreateAlertDefinitionForm>();

  return (
    <Controller
      render={({ field, fieldState }) => (
        <Autocomplete
          onChange={(
            _,
            selected: { label: string; value: AlertSeverityType },
            reason
          ) => {
            if (selected) {
              field.onChange(selected.value);
            }
            if (reason === 'clear') {
              field.onChange(null);
            }
          }}
          textFieldProps={{
            labelTooltipText:
              'Define a severity level associated with the alert to help you prioritize and manage alerts in the Recent activity tab.',
          }}
          value={
            field.value !== null
              ? alertSeverityOptions.find(
                  (option) => option.value === field.value
                )
              : null
          }
          data-testid="severity"
          errorText={fieldState.error?.message}
          label="Severity"
          onBlur={field.onBlur}
          options={alertSeverityOptions}
          placeholder="Select a Severity"
          size="medium"
        />
      )}
      control={control}
      name={name}
    />
  );
};
