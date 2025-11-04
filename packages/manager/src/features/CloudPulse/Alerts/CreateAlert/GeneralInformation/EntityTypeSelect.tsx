import { Autocomplete } from '@linode/ui';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { FieldPathByValue } from 'react-hook-form';

import type { Item } from '../../constants';
import type { CreateAlertDefinitionForm } from '../types';

interface EntityTypeSelectProps {
  /**
   * name used for the component in the form
   */
  name: FieldPathByValue<
    CreateAlertDefinitionForm,
    'linode' | 'nodebalancer' | null | undefined
  >;
  /**
   * Callback function triggered when entity type changes
   */
  onEntityTypeChange?: () => void;
}

const entityTypeOptions: Item<string, 'linode' | 'nodebalancer'>[] = [
  { label: 'Linodes', value: 'linode' },
  { label: 'NodeBalancers', value: 'nodebalancer' },
];

export const EntityTypeSelect = (props: EntityTypeSelectProps) => {
  const { name, onEntityTypeChange } = props;
  const { control } = useFormContext<CreateAlertDefinitionForm>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Autocomplete
          data-testid="entity-type-select"
          errorText={fieldState.error?.message}
          fullWidth
          label="Entity Type"
          onBlur={field.onBlur}
          onChange={(
            _,
            selected: { label: string; value: 'linode' | 'nodebalancer' },
            reason
          ) => {
            if (selected) {
              field.onChange(selected.value);
            }
            if (reason === 'clear') {
              field.onChange(null);
            }
            if (onEntityTypeChange) {
              onEntityTypeChange();
            }
          }}
          options={entityTypeOptions}
          placeholder="Select an Entity Type"
          sx={{ marginTop: '5px' }}
          value={
            entityTypeOptions.find((option) => option.value === field.value) ??
            null
          }
        />
      )}
    />
  );
};
