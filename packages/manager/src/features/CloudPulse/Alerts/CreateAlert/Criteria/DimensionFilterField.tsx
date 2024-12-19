import { Autocomplete } from '@linode/ui';
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
  const { dimensionOptions, name, onFilterDelete } = props;

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
      setValue(name, { ...fieldValue, dimension_label: selected.value });
    }
    if (operation === 'clear') {
      setValue(name, fieldValue);
    }
  };

  const dimensionFieldWatcher = useWatch({
    control,
    name: `${name}.dimension_label`,
  });

  const selectedDimension = React.useMemo(() => {
    return dimensionOptions && dimensionFieldWatcher
      ? dimensionOptions.find(
          (dim) => dim.dimension_label === dimensionFieldWatcher
        )
      : null;
  }, [dimensionFieldWatcher, dimensionOptions]);

  const valueOptions = React.useMemo(() => {
    return selectedDimension && selectedDimension.values
      ? selectedDimension.values.map((val) => ({ label: val, value: val }))
      : [];
  }, [selectedDimension]);

  return (
    <Grid alignItems="flex-start" container spacing={2}>
      <Grid item md={3} sm={6} xs={12}>
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
                field.value !== null
                  ? dataFieldOptions.find(
                      (option) => option.value === field.value
                    ) ?? null
                  : null
              }
              data-testid="Data-field"
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
      <Grid item md={2} sm={3} xs={12}>
        <Controller
          render={({ field, fieldState }) => (
            <Autocomplete
              onChange={(
                _,
                newValue: { label: string; value: DimensionFilterOperatorType },
                operation
              ) => {
                if (operation === 'selectOption') {
                  field.onChange(newValue.value);
                }
                if (operation === 'clear') {
                  field.onChange(null);
                }
              }}
              value={
                field.value !== null
                  ? DimensionOperatorOptions.find(
                      (option) => option.value === field.value
                    ) ?? null
                  : null
              }
              data-testid="Operator"
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
      <Grid item md={3} sm={4} xs={12}>
        <Controller
          render={({ field, fieldState }) => (
            <Autocomplete
              onChange={(
                _,
                selected: { label: string; value: string },
                operation
              ) => {
                if (operation === 'selectOption') {
                  field.onChange(selected.value);
                }
                if (operation === 'clear') {
                  field.onChange(null);
                }
              }}
              value={
                field.value !== null
                  ? valueOptions.find(
                      (option) => option.value === field.value
                    ) ?? null
                  : null
              }
              data-testid="Value"
              errorText={fieldState.error?.message}
              label="Value"
              onBlur={field.onBlur}
              options={valueOptions}
              placeholder="Select a Value"
            />
          )}
          control={control}
          name={`${name}.value`}
        />
      </Grid>
      <Grid item marginTop={6} paddingLeft={1}>
        <ClearIconButton handleClick={onFilterDelete} />
      </Grid>
    </Grid>
  );
};
