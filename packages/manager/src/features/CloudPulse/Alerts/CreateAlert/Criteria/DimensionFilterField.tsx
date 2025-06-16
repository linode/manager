import { Autocomplete, Box, TextField } from '@linode/ui';
import { capitalize } from '@linode/utilities';
import { GridLegacy } from '@mui/material';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { FieldPathByValue } from 'react-hook-form';

import { dimensionOperatorOptions, textFieldOperators } from '../../constants';
import { ClearIconButton } from './ClearIconButton';

import type { Item } from '../../constants';
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

  const dimensionValueWatcher = useWatch({ control, name: `${name}.value` });
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
  const isValueMultiple =
    valueOptions().length > 0 && dimensionOperatorWatcher === 'in';

  const isTextField =
    !valueOptions().length ||
    (dimensionOperatorWatcher
      ? textFieldOperators.includes(dimensionOperatorWatcher)
      : false);

  const valuePlaceholder = `${isTextField ? 'Enter' : 'Select'} a Value`;

  const resolveSelectedValues = (
    options: Item<string, string>[],
    value: null | string,
    isMultiple: boolean
  ): Item<string, string> | Item<string, string>[] | null => {
    if (!value) return isMultiple ? [] : null;

    if (isMultiple) {
      return options.filter((option) =>
        value.split(',').includes(option.value)
      );
    }

    return options.find((option) => option.value === value) ?? null;
  };

  const handleValueChange = (
    selected: Item<string, string> | Item<string, string>[] | null,
    operation: string,
    isMultiple: boolean
  ): string => {
    if (operation !== 'selectOption') return '';

    if (isMultiple && Array.isArray(selected)) {
      return selected.map((item) => item.value).join(',');
    }

    if (!isMultiple && selected && !Array.isArray(selected)) {
      return selected.value;
    }

    return '';
  };

  return (
    <GridLegacy
      container
      data-testid={`${name}-id`}
      sx={{
        gap: 2,
      }}
    >
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
      <GridLegacy item md={2} xs={12}>
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
      <GridLegacy item md={3} xs={12}>
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
                  placeholder={
                    dimensionOperatorWatcher === 'in'
                      ? dimensionFieldWatcher === 'port'
                        ? 'Enter Value(s) (e.g., 80,443,3000)'
                        : 'Enter Value(s) (e.g., abc, xyz)'
                      : 'Enter a Value'
                  }
                  sx={{ flex: 1, width: '256px' }}
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
                  limitTags={1}
                  multiple={isValueMultiple}
                  onBlur={field.onBlur}
                  onChange={(_, selected, operation) => {
                    field.onChange(
                      handleValueChange(selected, operation, isValueMultiple)
                    );
                  }}
                  options={valueOptions()}
                  placeholder={
                    dimensionValueWatcher &&
                    (!Array.isArray(dimensionValueWatcher) ||
                      dimensionValueWatcher.length)
                      ? ''
                      : valuePlaceholder
                  }
                  sx={{ flex: 1 }}
                  value={resolveSelectedValues(
                    valueOptions(),
                    field.value,
                    isValueMultiple
                  )}
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
