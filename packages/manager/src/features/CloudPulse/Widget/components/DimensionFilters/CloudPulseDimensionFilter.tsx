import { Autocomplete, Box } from '@linode/ui';
import { GridLegacy } from '@mui/material';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { FieldPathByValue } from 'react-hook-form';

import { dimensionOperatorOptions } from 'src/features/CloudPulse/Alerts/constants';
import { ClearIconButton } from 'src/features/CloudPulse/Alerts/CreateAlert/Criteria/ClearIconButton';
import { ValueFieldRenderer } from 'src/features/CloudPulse/Alerts/CreateAlert/Criteria/DimensionFilterValue/ValueFieldRenderer';

import type { Dimension, DimensionFilterOperatorType } from '@linode/api-v4';
import type {
  DimensionFilterForm,
  OnlyDimensionFilterForm,
} from 'src/features/CloudPulse/Alerts/CreateAlert/types';

interface CloudPulseDimensionFilterProps {
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
  name: FieldPathByValue<OnlyDimensionFilterForm, DimensionFilterForm>;
  /**
   * function to delete the DimensionFilter component
   * @returns void
   */
  onFilterDelete: () => void;

  /**
   * The selected entities for the dimension filter
   */
  selectedEntities?: string[];
}

export const CloudPulseDimensionFilter = (
  props: CloudPulseDimensionFilterProps
) => {
  const {
    dataFieldDisabled,
    dimensionOptions,
    name,
    onFilterDelete,
    selectedEntities,
  } = props;

  const { control, setValue } = useFormContext<OnlyDimensionFilterForm>();

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

  return (
    <GridLegacy
      container
      data-testid={`${name}-id`}
      flexWrap="wrap"
      spacing={2}
    >
      <GridLegacy item md={3.5} xs={12}>
        <Controller
          control={control}
          name={`${name}.dimension_label`}
          render={({ field, fieldState }) => (
            <Autocomplete
              data-qa-dimension-filter={`${name}-dimension-field`}
              data-testid="dimension-field"
              disabled={dataFieldDisabled}
              errorText={fieldState.error?.message}
              label="Dimension"
              onBlur={field.onBlur}
              onChange={(
                _,
                newValue: { label: string; value: string },
                operation
              ) => {
                handleDataFieldChange(newValue, operation);
              }}
              options={dataFieldOptions}
              placeholder="Select a Dimension"
              value={
                dataFieldOptions.find(
                  (option) => option.value === field.value
                ) ?? null
              }
            />
          )}
        />
      </GridLegacy>
      <GridLegacy item md={3.5} xs={12}>
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
                setValue(`${name}.value`, null);
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
      <GridLegacy item md={3.5} xs={12}>
        <Controller
          control={control}
          name={`${name}.value`}
          render={({ field, fieldState }) => (
            <ValueFieldRenderer
              dimensionLabel={dimensionFieldWatcher}
              disabled={!dimensionFieldWatcher}
              entities={selectedEntities}
              errorText={fieldState.error?.message}
              name={name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              operator={dimensionOperatorWatcher}
              scope={'entity'}
              selectedRegions={[]}
              serviceType={'linode'}
              value={field.value}
              values={selectedDimension?.values ?? []}
            />
          )}
        />
      </GridLegacy>
      <GridLegacy item>
        <Box alignContent="flex-start" mt={6}>
          <ClearIconButton handleClick={onFilterDelete} />
        </Box>
      </GridLegacy>
    </GridLegacy>
  );
};
