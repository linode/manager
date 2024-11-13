import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

import { alertSeverityOptions } from '../../constants';

import type { AlertSeverityType } from '@linode/api-v4';
export interface CloudViewRegionSelectProps {
  /**
   * name used for the component in the form
   */
  name: string;
}

export const CloudPulseAlertSeveritySelect = (
  props: CloudViewRegionSelectProps
) => {
  const { name } = props;

  const { control } = useFormContext();

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
              'Define a severity level associated with the alert to help you prioritize and manage alerts in the Recent activity tab',
          }}
          value={
            field.value !== null
              ? alertSeverityOptions.find(
                  (option) => option.value === field.value
                )
              : null
          }
          data-testid={'severity'}
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
