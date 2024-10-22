import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

import { AlertSeverityOptions } from '../../constants';
import { ErrorMessage } from '../CreateAlertDefinition';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeverity]);

  return (
    <Controller
      render={({ field, fieldState }) => (
        <>
          <Autocomplete
            isOptionEqualToValue={(option, value) =>
              option.label === value.label
            }
            onChange={(_, value) => {
              setSelectedSeverity(value);
            }}
            textFieldProps={{
              labelTooltipText:
                'Define a severity level associated with the alert to help you prioritize and manage alerts in the Recent activity tab',
            }}
            data-testid={'severity'}
            label="Severity"
            onBlur={field.onBlur}
            options={AlertSeverityOptions}
            size="medium"
            value={selectedSeverity}
          />
          <ErrorMessage
            errors={fieldState.error?.message}
            touched={fieldState.isTouched}
          />
        </>
      )}
      control={control}
      name={name}
    />
  );
};
