import { Autocomplete, Box } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { Grid } from '@mui/material';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { FieldPathByValue } from 'react-hook-form';

import { dimensionOperatorOptions, textFieldOperators } from '../../constants';
import { ClearIconButton } from './ClearIconButton';
import { InputValueField } from './InputValueField';

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
    <Grid
      container
      data-testid={`${name}-id`}
      sx={{
        gap: 2,
      }}
    >
      <Grid item md={3} xs={12}>
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
      </Grid>
      <Grid item md={2} xs={12}>
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
      </Grid>
      <Grid item md={3} xs={12}>
        <Box display="flex" gap={2}>
          <Controller
            control={control}
            name={`${name}.value`}
            render={({ field, fieldState }) => (
              <InputValueField
                data-qa-dimension-filter={`${name}-value`}
                data-testid="value"
                disabled={!dimensionFieldWatcher}
                errorText={fieldState.error?.message}
                isTextField={isTextField}
                label="Value"
                onBlur={field.onBlur}
                onChange={(value: null | string) => field.onChange(value)}
                options={valueOptions()}
                placeholder={`${isTextField ? 'Enter' : 'Select'} a Value`}
                sx={{ flex: 1 }}
                value={field.value}
              />
            )}
          />
          <Box alignContent="center" mt={5}>
            <ClearIconButton handleClick={onFilterDelete} />
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};
