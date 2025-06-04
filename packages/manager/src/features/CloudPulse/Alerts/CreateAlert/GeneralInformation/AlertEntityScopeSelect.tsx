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

import type { AlertFormMode } from '../../constants';
import type { CreateAlertDefinitionForm } from '../types';
import type { AlertDefinitionGroup, AlertServiceType } from '@linode/api-v4';
interface ScopeOption {
  disabled: boolean;
  label: string;
  value: AlertDefinitionGroup;
}
interface AlertEntityScopeSelectProps {
  formMode?: AlertFormMode;
  name: FieldPathByValue<
    CreateAlertDefinitionForm,
    AlertDefinitionGroup | null
  >;
  serviceType: AlertServiceType | null;
}
export const AlertEntityScopeSelect = (props: AlertEntityScopeSelectProps) => {
  const { name, serviceType, formMode = 'create' } = props;
  const { isLoading, data } = useCloudPulseServiceByType(serviceType);
  const { control, setValue } = useFormContext<CreateAlertDefinitionForm>();

  const options: ScopeOption[] = React.useMemo(() => {
    const scopes = data?.alert?.scope ?? [];
    return scopes.length === 0
      ? []
      : entityGroupingOptions.map((option) => ({
          ...option,
          disabled: !scopes.includes(option.value),
        }));
  }, [data?.alert?.scope]);

  const getSelectedOption = (
    value: null | string,
    options: ScopeOption[]
  ): null | ScopeOption => {
    if (options.length === 0) {
      return null;
    }

    let selectedOption =
      options.find((option) => option.value === value) ?? null;

    if (!selectedOption || selectedOption.disabled) {
      selectedOption = options.find((o) => !o.disabled) ?? null;
    }

    return selectedOption;
  };

  React.useEffect(() => {
    if (formMode === 'create') {
      if (options.length === 0) {
        setValue(name, null);
        return;
      }
      const selectedOption = getSelectedOption(null, options);

      // Update the form value only if we're in create mode
      setValue(name, selectedOption?.value ?? null);
    }
  }, [formMode, name, options, setValue]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <Autocomplete
            data-testid="entity-grouping"
            disableClearable={options.length !== 0}
            disabled={!serviceType || isLoading}
            errorText={fieldState.error?.message}
            getOptionLabel={(option) => option.label}
            label="Scope"
            loading={isLoading}
            onBlur={field.onBlur}
            onChange={(_, selectedValue) => {
              const value = selectedValue?.value;
              field.onChange(value);
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
            value={getSelectedOption(field.value, options)}
          />
        );
      }}
    />
  );
};
