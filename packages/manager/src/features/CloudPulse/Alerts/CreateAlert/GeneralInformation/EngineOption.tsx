import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

import { engineTypeOptions } from '../../constants';

import type { CreateAlertDefinitionForm } from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';

interface EngineOptionProps {
  /**
   * name used for the component to set in the form
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, null | string>;
}
export const EngineOption = (props: EngineOptionProps) => {
  const { name } = props;
  const { control } = useFormContext<CreateAlertDefinitionForm>();
  return (
    <Controller
      render={({ field, fieldState }) => (
        <Autocomplete
          onChange={(_, selected: { label: string; value: string }, reason) => {
            if (reason === 'selectOption') {
              field.onChange(selected.value);
            }
            if (reason === 'clear') {
              field.onChange(null);
            }
          }}
          value={
            field.value !== null
              ? engineTypeOptions.find((option) => option.value === field.value)
              : null
          }
          data-testid="engine-option"
          errorText={fieldState.error?.message}
          label="Engine Option"
          onBlur={field.onBlur}
          options={engineTypeOptions}
          placeholder="Select an Engine"
        />
      )}
      control={control}
      name={name}
    />
  );
};
