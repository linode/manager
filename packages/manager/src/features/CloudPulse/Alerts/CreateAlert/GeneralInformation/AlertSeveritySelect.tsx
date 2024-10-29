import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

import { AlertSeverityOptions } from '../../constants';
export interface CloudViewRegionSelectProps {
  /**
   * name used for the component in the form
   */
  name: string;
}

type CloudPulseAlertSeverityOptions = {
  label: string;
  value: string;
};

export const CloudPulseAlertSeveritySelect = (
  props: CloudViewRegionSelectProps
) => {
  const { name } = props;

  const { control, setValue } = useFormContext();

  const [
    selectedSeverity,
    setSelectedSeverity,
  ] = React.useState<CloudPulseAlertSeverityOptions | null>(null);

  React.useEffect(() => {
    setValue(name, selectedSeverity?.value ?? '');
  }, [name, selectedSeverity, setValue]);

  return (
    <Controller
      render={({ field, fieldState }) => (
        <Autocomplete
          onChange={(_, value) => {
            setSelectedSeverity(value);
          }}
          textFieldProps={{
            labelTooltipText:
              'Define a severity level associated with the alert to help you prioritize and manage alerts in the Recent activity tab',
          }}
          data-testid={'severity'}
          errorText={fieldState.error?.message}
          isOptionEqualToValue={(option, value) => option.label === value.label}
          label="Severity"
          onBlur={field.onBlur}
          options={AlertSeverityOptions}
          size="medium"
          value={selectedSeverity}
        />
      )}
      control={control}
      name={name}
    />
  );
};
