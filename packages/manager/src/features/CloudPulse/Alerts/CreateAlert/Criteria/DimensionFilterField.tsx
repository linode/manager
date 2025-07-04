import { Autocomplete, Box, TextField } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { GridLegacy } from '@mui/material';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { FieldPathByValue } from 'react-hook-form';

import { dimensionOperatorOptions, textFieldOperators } from '../../constants';
import { ClearIconButton } from './ClearIconButton';

import type { CreateAlertDefinitionForm, DimensionFilterForm } from '../types';
import type { Dimension, DimensionFilterOperatorType } from '@linode/api-v4';

interface DimensionFilterFieldProps {
  /**
   * boolean value to disable the Data Field in dimension filter
   */
  dataFieldDisabled: boolean;
  /**
   * dimension filter data options to list in the Autocomplete component
   */
  dimensionOptions: Dimension[];
  /**
   * name (with the index) used for the component to set in form
   */
  name: FieldPathByValue<CreateAlertDefinitionForm, DimensionFilterForm>;
  /**
   * function to delete the DimensionFilter component
   * @returns void
   */
  onFilterDelete: () => void;
}

export const DimensionFilterField = (props: DimensionFilterFieldProps) => {
  const { dataFieldDisabled, dimensionOptions, name, onFilterDelete } = props;

  const { control, setValue } = useFormContext<CreateAlertDefinitionForm>();

  const dataFieldOptions =
    dimensionOptions.map((dimension) => ({
      label: dimension.label,
      value: dimension.dimension_label,
    })) ?? [];

  const handleDataFieldChange = (
    selected: { label: string; value: string },
    operation: string
  ) => {
    const fieldValue = {
      dimension_label: null,
      operator: null,
      value: null,
    };
    if (operation === 'selectOption') {
      setValue(`${name}.dimension_label`, selected.value, {
        shouldValidate: true,
      });
      setValue(`${name}.operator`, fieldValue.operator);
      setValue(`${name}.value`, fieldValue.value);
    } else {
      setValue(name, fieldValue);
    }
  };

  const dimensionFieldWatcher = useWatch({
    control,
    name: `${name}.dimension_label`,
  });

  const dimensionOperatorWatcher = useWatch({
    control,
    name: `${name}.operator`,
  });

  const selectedDimension =
    dimensionOptions && dimensionFieldWatcher
      ? (dimensionOptions.find(
          (dim) => dim.dimension_label === dimensionFieldWatcher
        ) ?? null)
      : null;

  const valueOptions = () => {
    if (selectedDimension !== null && selectedDimension.values) {
      return selectedDimension.values.map((val) => ({
        label: capitalize(val),
        value: val,
      }));
    }
    return [];
  };
  const isTextField = dimensionOperatorWatcher
    ? textFieldOperators.includes(dimensionOperatorWatcher)
    : false;
  return (
    <GridLegacy container data-testid={`${name}-id`} spacing={2}>
      <GridLegacy item md={3} xs={12}>
        <Controller
          control={control}
          name={`${name}.dimension_label`}
          render={({ field, fieldState }) => (
            <Autocomplete
              data-qa-dimension-filter={`${name}-data-field`}
              data-testid="data-field"
              disabled={dataFieldDisabled}
              errorText={fieldState.error?.message}
              label="Data Field"
              onBlur={field.onBlur}
              onChange={(
                _,
                newValue: { label: string; value: string },
                operation
              ) => {
                handleDataFieldChange(newValue, operation);
              }}
              options={dataFieldOptions}
              placeholder="Select a Data Field"
              value={
                dataFieldOptions.find(
                  (option) => option.value === field.value
                ) ?? null
              }
            />
          )}
        />
      </GridLegacy>
      <GridLegacy item lg={2} md={3} xs={12}>
        <Controller
          control={control}
          name={`${name}.operator`}
          render={({ field, fieldState }) => (
            <Autocomplete
              data-qa-dimension-filter={`${name}-operator`}
              data-testid="operator"
              disabled={!dimensionFieldWatcher}
              errorText={fieldState.error?.message}
              label="Operator"
              onBlur={field.onBlur}
              onChange={(
                _,
                newValue: { label: string; value: DimensionFilterOperatorType },
                operation
              ) => {
                field.onChange(
                  operation === 'selectOption' ? newValue.value : null
                );
              }}
              options={dimensionOperatorOptions}
              placeholder="Select an Operator"
              value={
                dimensionOperatorOptions.find(
                  (option) => option.value === field.value
                ) ?? null
              }
            />
          )}
        />
      </GridLegacy>
      <GridLegacy item lg={3} md={4} xs={12}>
        <Box display="flex" gap={2}>
          <Controller
            control={control}
            name={`${name}.value`}
            render={({ field, fieldState }) =>
              isTextField ? (
                <TextField
                  data-qa-dimension-filter={`${name}-value`}
                  data-testid="value"
                  disabled={!dimensionFieldWatcher}
                  errorText={fieldState.error?.message}
                  label="Value"
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.value)}
                  placeholder={`${isTextField ? 'Enter' : 'Select'} a Value`}
                  sx={{ flex: 1, maxWidth: '256px' }}
                  value={field.value ?? ''}
                />
              ) : (
                <Autocomplete
                  data-qa-dimension-filter={`${name}-value`}
                  data-testid="value"
                  disabled={!dimensionFieldWatcher}
                  errorText={fieldState.error?.message}
                  isOptionEqualToValue={(option, value) =>
                    value.value === option.value
                  }
                  label="Value"
                  onBlur={field.onBlur}
                  onChange={(
                    _,
                    selected: { label: string; value: string },
                    operation
                  ) => {
                    field.onChange(
                      operation === 'selectOption' ? selected.value : null
                    );
                  }}
                  options={valueOptions()}
                  placeholder={`${isTextField ? 'Enter' : 'Select'} a Value`}
                  sx={{ flex: 1 }}
                  value={
                    valueOptions().find(
                      (option) => option.value === field.value
                    ) ?? null
                  }
                />
              )
            }
          />
          <Box alignContent="flex-start" mt={6}>
            <ClearIconButton handleClick={onFilterDelete} />
          </Box>
        </Box>
      </GridLegacy>
    </GridLegacy>
  );
};
