import { Autocomplete, Box } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { DimensionOperatorOptions } from '../../constants';
import { ClearIconButton } from './ClearIconButton';

import type { CreateAlertDefinitionForm, DimensionFilterForm } from '../types';
import type { Dimension, DimensionFilterOperatorType } from '@linode/api-v4';
import type { FieldPathByValue } from 'react-hook-form';

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
    setValue(
      name,
      operation === 'selectOption'
        ? { ...fieldValue, dimension_label: selected.value }
        : fieldValue,
      { shouldValidate: true }
    );
  };

  const dimensionFieldWatcher = useWatch({
    control,
    name: `${name}.dimension_label`,
  });

  const selectedDimension =
    dimensionOptions && dimensionFieldWatcher
      ? dimensionOptions.find(
          (dim) => dim.dimension_label === dimensionFieldWatcher
        ) ?? null
      : null;

  const valueOptions = () => {
    if (selectedDimension !== null) {
      return selectedDimension.values.map((val) => ({
        label: val,
        value: val,
      }));
    }
    return [];
  };

  return (
    <Grid container data-testid={`${name}-id`} gap={2}>
      <Grid item md={3} xs={12}>
        <Controller
          render={({ field, fieldState }) => (
            <Autocomplete
              onChange={(
                _,
                newValue: { label: string; value: string },
                operation
              ) => {
                handleDataFieldChange(newValue, operation);
              }}
              value={
                dataFieldOptions.find(
                  (option) => option.value === field.value
                ) ?? null
              }
              data-testid="data-field"
              disabled={dataFieldDisabled}
              errorText={fieldState.error?.message}
              label="Data Field"
              onBlur={field.onBlur}
              options={dataFieldOptions}
              placeholder="Select a Data field"
            />
          )}
          control={control}
          name={`${name}.dimension_label`}
        />
      </Grid>
      <Grid item md={2} xs={12}>
        <Controller
          render={({ field, fieldState }) => (
            <Autocomplete
              onChange={(
                _,
                newValue: { label: string; value: DimensionFilterOperatorType },
                operation
              ) => {
                field.onChange(
                  operation === 'selectOption' ? newValue.value : null
                );
              }}
              value={
                DimensionOperatorOptions.find(
                  (option) => option.value === field.value
                ) ?? null
              }
              data-testid="operator"
              errorText={fieldState.error?.message}
              label="Operator"
              onBlur={field.onBlur}
              options={DimensionOperatorOptions}
            />
          )}
          control={control}
          name={`${name}.operator`}
        />
      </Grid>
      <Grid item md={3} xs={12}>
        <Box display="flex" gap={2}>
          <Controller
            render={({ field, fieldState }) => (
              <Autocomplete
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                onChange={(
                  _,
                  selected: { label: string; value: string },
                  operation
                ) => {
                  field.onChange(
                    operation === 'selectOption' ? selected.value : null
                  );
                }}
                value={
                  valueOptions().find(
                    (option) => option.value === field.value
                  ) ?? null
                }
                data-testid="value"
                disabled={!dimensionFieldWatcher}
                errorText={fieldState.error?.message}
                label="Value"
                onBlur={field.onBlur}
                options={valueOptions()}
                placeholder="Select a Value"
                sx={{ flex: 1 }}
              />
            )}
            control={control}
            name={`${name}.value`}
          />
          <Box alignContent="center" mt={5}>
            <ClearIconButton handleClick={onFilterDelete} />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
