import { Autocomplete, Box } from '@linode/ui';
import { GridLegacy } from '@mui/material';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { FieldPathByValue } from 'react-hook-form';

import { dimensionOperatorOptions } from '../../constants';
import { ClearIconButton } from './ClearIconButton';
import { ValueFieldRenderer } from './DimensionFilterValue/ValueFieldRenderer';

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

  const { control, resetField } = useFormContext<CreateAlertDefinitionForm>();

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
      resetField(name, {
        defaultValue: { ...fieldValue, dimension_label: selected.value },
      });
    } else {
      resetField(name, { defaultValue: fieldValue });
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

  const entities = useWatch({
    control,
    name: 'entity_ids',
  });
  const entityType = useWatch({
    control,
    name: 'entity_type',
  });
  const serviceType = useWatch({
    control,
    name: 'serviceType',
  });
  const scopeWatcher = useWatch({
    control,
    name: 'scope',
  });
  const selectedRegionsWatcher = useWatch({ control, name: 'regions' });
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
      <GridLegacy item lg={3} md={4} xs={12}>
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
                resetField(`${name}.value`, { defaultValue: null });
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
        <Controller
          control={control}
          name={`${name}.value`}
          render={({ field, fieldState }) => (
            <ValueFieldRenderer
              dimensionLabel={dimensionFieldWatcher}
              disabled={!dimensionFieldWatcher}
              entities={entities}
              entityType={entityType ?? undefined}
              errorText={fieldState.error?.message}
              name={name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              operator={dimensionOperatorWatcher}
              scope={scopeWatcher}
              selectedRegions={selectedRegionsWatcher}
              serviceType={serviceType}
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
