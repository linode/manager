import { Autocomplete } from '@linode/ui';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';

import type { Item } from '../../constants';
import type { CreateAlertDefinitionForm } from '../types';
import type { AlertServiceType } from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';

interface CloudPulseServiceSelectProps {
  /**
   * @returns vsoid
   * function to handle the service type change
   */
  handleServiceTypeChange?: () => void;
  /**
   * Boolean value to check if service select is disabled in the edit flow
   */
  isDisabled?: boolean;
  /**
   * name used for the component in the form
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, AlertServiceType | null>;
}

export const CloudPulseServiceSelect = (
  props: CloudPulseServiceSelectProps
) => {
  const { handleServiceTypeChange, isDisabled, name } = props;
  const {
    data: serviceOptions,
    error: serviceTypesError,
    isLoading: serviceTypesLoading,
  } = useCloudPulseServiceTypes(true);
  const { control } = useFormContext<CreateAlertDefinitionForm>();

  const getServicesList = React.useMemo((): Item<
    string,
    AlertServiceType
  >[] => {
    return serviceOptions &&
      serviceOptions.data &&
      serviceOptions.data.length > 0
      ? serviceOptions.data.map((service) => ({
          label: service.label,
          value: service.service_type as AlertServiceType,
        }))
      : [];
  }, [serviceOptions]);

  return (
    <Controller
      render={({ field, fieldState }) => (
        <Autocomplete
          errorText={
            fieldState.error?.message ??
            (serviceTypesError ? 'Failed to fetch the service types.' : '')
          }
          onChange={(
            _,
            selected: { label: string; value: AlertServiceType },
            reason
          ) => {
            if (selected) {
              field.onChange(selected.value);
            }
            if (reason === 'clear') {
              field.onChange(null);
            }
            if (handleServiceTypeChange !== undefined) {
              handleServiceTypeChange();
            }
          }}
          value={
            getServicesList.find((option) => option.value === field.value) ??
            null
          }
          data-testid="servicetype-select"
          disabled={isDisabled}
          fullWidth
          label="Service"
          loading={serviceTypesLoading && !serviceTypesError}
          onBlur={field.onBlur}
          options={getServicesList}
          placeholder="Select a Service"
          sx={{ marginTop: '5px' }}
        />
      )}
      control={control}
      name={name}
    />
  );
};
