import { Autocomplete, Box } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { Grid } from '@mui/material';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { dimensionOperatorOptions } from '../../constants';
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

  const selectedDimension =
    dimensionOptions && dimensionFieldWatcher
      ? dimensionOptions.find(
          (dim) => dim.dimension_label === dimensionFieldWatcher
        ) ?? null
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

  return (
    <Grid
      container
      data-testid={`${name}-id`}
      sx={{
        gap: 2,
      }}
    >
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
              data-qa-dimension-filter={`${name}-data-field`}
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
                dimensionOperatorOptions.find(
                  (option) => option.value === field.value
                ) ?? null
              }
              data-qa-dimension-filter={`${name}-operator`}
              data-testid="operator"
              disabled={!dimensionFieldWatcher}
              errorText={fieldState.error?.message}
              label="Operator"
              onBlur={field.onBlur}
              options={dimensionOperatorOptions}
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
                data-qa-dimension-filter={`${name}-value`}
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
