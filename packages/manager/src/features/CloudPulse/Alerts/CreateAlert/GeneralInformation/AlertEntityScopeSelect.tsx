import { Autocomplete, Box, ListItem, SelectedIcon } from '@linode/ui';
import React from 'react';
import {
  Controller,
  type FieldPathByValue,
  useFormContext,
} from 'react-hook-form';

import { useCloudPulseServiceByType } from 'src/queries/cloudpulse/services';

import {
  ALERT_SCOPE_TOOLTIP_TEXT,
  entityGroupingOptions,
} from '../../constants';

import type { CreateAlertDefinitionForm } from '../types';
import type { AlertDefinitionGroup, AlertServiceType } from '@linode/api-v4';

interface ScopeOption {
  disabled: boolean;
  label: string;
  value: AlertDefinitionGroup;
}
interface AlertEntityScopeSelectProps {
  name: FieldPathByValue<
    CreateAlertDefinitionForm,
    AlertDefinitionGroup | null
  >;
  serviceType: AlertServiceType | null;
}

export const AlertEntityScopeSelect = (props: AlertEntityScopeSelectProps) => {
  const { name, serviceType } = props;

  const { isLoading, data } = useCloudPulseServiceByType(serviceType);
  const scopes = data?.alert?.scope ?? [];
  const options =
    scopes.length === 0
      ? []
      : entityGroupingOptions.map<ScopeOption>((option) => ({
          ...option,
          disabled: !scopes.includes(option.value),
        }));
  const { control, setValue } = useFormContext<CreateAlertDefinitionForm>();

  const getSelectedValue = (
    value: AlertDefinitionGroup | null,
    options: ScopeOption[]
  ): null | ScopeOption => {
    if (options.length === 0) {
      return null;
    }

    let selectedOption = options.find((option) => option.value === value);

    if (!selectedOption || selectedOption.disabled) {
      selectedOption = options.find((option) => !option.disabled);
    }
    return selectedOption ?? null;
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Autocomplete
          data-testid="entity-grouping"
          disableClearable={options.length !== 0}
          disabled={!serviceType || isLoading}
          errorText={fieldState.error?.message}
          label="Scope"
          loading={isLoading}
          onBlur={field.onBlur}
          onChange={(_, selectedValue) => {
            const value = selectedValue?.value;
            if (value) {
              field.onChange(value);
            }

            setValue('regions', value === 'region' ? [] : undefined);
            setValue('entity_ids', value === 'entity' ? [] : undefined);
          }}
          options={options}
          placeholder="Select a scope"
          renderOption={(props, option, { selected }) => {
            const { key, ...rest } = props;

            return (
              <ListItem
                {...rest}
                aria-disabled={option.disabled}
                data-qa-option
                key={key}
              >
                <Box flexGrow={1}>{option.label}</Box>
                <SelectedIcon visible={selected} />
              </ListItem>
            );
          }}
          size="medium"
          textFieldProps={{
            labelTooltipText: ALERT_SCOPE_TOOLTIP_TEXT,
          }}
          value={getSelectedValue(field.value, options)}
        />
      )}
    />
  );
};
