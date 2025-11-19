import { TextField } from '@linode/ui';
import React from 'react';

import { BlockStorageDimensionFilterAutocomplete } from './BlockStorageDimensionFilterAutocomplete';
import {
  MULTISELECT_PLACEHOLDER_TEXT,
  SINGLESELECT_PLACEHOLDER_TEXT,
  TEXTFIELD_PLACEHOLDER_TEXT,
  valueFieldConfig,
} from './constants';
import { DimensionFilterAutocomplete } from './DimensionFilterAutocomplete';
import { FirewallDimensionFilterAutocomplete } from './FirewallDimensionFilterAutocomplete';
import { ObjectStorageDimensionFilterAutocomplete } from './ObjectStorageDimensionFilterAutocomplete';
import { getOperatorGroup } from './utils';

import type { OperatorGroup, ValueFieldConfig } from './constants';
import type {
  AlertDefinitionScope,
  CloudPulseServiceType,
  DimensionFilterOperatorType,
} from '@linode/api-v4';

interface ValueFieldRendererProps {
  /**
   * The dimension_label extracted from the Dimension Data.
   */
  dimensionLabel: null | string;

  /**
   * Disables the input field when set to true.
   */
  disabled: boolean;

  /**
   * List of entity IDs used to filter resources like firewalls.
   */
  entities?: string[];
  /**
   * Error message to be displayed under the input field, if any.
   */
  errorText: string | undefined;

  /**
   * The name of the field set in the form.
   */
  name: string;

  /**
   * Triggered when the input field loses focus.
   */
  onBlur: () => void;

  /**
   * Callback fired when the value changes.
   */
  onChange: (value: string | string[]) => void;
  /**
   * The operator used in the current filter. Used to determine the type of input to show.
   */
  operator: DimensionFilterOperatorType | null;
  /**
   * Scope of fetching: account (all entities) or entity (filtered subset) or region (entities bound to selected region).
   */
  scope?: AlertDefinitionScope | null;
  /**
   * List of selected regions under the region scope
   */
  selectedRegions?: string[];
  /**
   * Service type of the alert
   */
  serviceType?: CloudPulseServiceType | null;
  /**
   * The type of monitoring to filter on.
   */
  type?: 'alerts' | 'metrics';
  /**
   * The currently selected value for the input field.
   */
  value: null | string;

  /**
   * List of pre-defined values, used for static autocomplete options.
   */
  values: null | string[];
}

export const ValueFieldRenderer = (props: ValueFieldRendererProps) => {
  const {
    serviceType,
    scope,
    dimensionLabel,
    disabled,
    entities,
    errorText,
    name,
    onBlur,
    onChange,
    operator,
    value,
    values,
    selectedRegions,
    type = 'alerts',
  } = props;
  // Use operator group for config lookup
  const operatorGroup = getOperatorGroup(operator);
  let dimensionConfig: Record<OperatorGroup, ValueFieldConfig>;

  if (dimensionLabel && valueFieldConfig[dimensionLabel]) {
    // 1. Use dimension-specific config if available
    dimensionConfig = valueFieldConfig[dimensionLabel];
  } else if (!values || values.length === 0) {
    // 2. No dimension-specific config & no values → use emptyValue
    dimensionConfig = valueFieldConfig['emptyValue'];
  } else {
    // 3. No dimension-specific config & values present → use *
    dimensionConfig = valueFieldConfig['*'];
  }
  const config = dimensionConfig[operatorGroup];
  if (!config) return null;

  if (config.type === 'textfield') {
    return (
      <TextField
        data-qa-dimension-filter={`${name}-value`}
        data-testid="value"
        disabled={disabled}
        errorText={errorText}
        fullWidth
        helperText={!errorText ? config.helperText : undefined}
        label="Value"
        max={config.max}
        min={config.min}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder ?? TEXTFIELD_PLACEHOLDER_TEXT}
        sx={{ flex: 1 }}
        type={config.inputType}
        value={value ?? ''}
      />
    );
  }

  if (config.type === 'autocomplete') {
    const autocompletePlaceholder = config.multiple
      ? MULTISELECT_PLACEHOLDER_TEXT
      : SINGLESELECT_PLACEHOLDER_TEXT;

    // Common props shared across all autocomplete components
    const commonAutocompleteProps = {
      dimensionLabel,
      disabled,
      errorText,
      fieldOnBlur: onBlur,
      fieldOnChange: onChange,
      fieldValue: value,
      multiple: config.multiple,
      name,
      placeholderText: config.placeholder ?? autocompletePlaceholder,
      serviceType: serviceType ?? null,
      type,
    };

    // Determine custom fetch behaviour if there are same dimension_labels across service types
    const customFetch = Array.isArray(config.useCustomFetch)
      ? config.useCustomFetch.includes(serviceType ?? '')
        ? serviceType
        : undefined
      : config.useCustomFetch === serviceType
        ? serviceType
        : undefined;

    switch (customFetch) {
      case 'blockstorage':
        return (
          <BlockStorageDimensionFilterAutocomplete
            {...commonAutocompleteProps}
            entities={entities}
            scope={scope}
            selectedRegions={selectedRegions}
          />
        );
      case 'firewall':
        return (
          <FirewallDimensionFilterAutocomplete
            {...commonAutocompleteProps}
            entities={entities}
            scope={scope}
            selectedRegions={selectedRegions}
          />
        );
      case 'objectstorage':
        return (
          <ObjectStorageDimensionFilterAutocomplete
            {...commonAutocompleteProps}
            entities={entities ?? []}
            scope={scope}
            selectedRegions={selectedRegions}
          />
        );
      default:
        return (
          <DimensionFilterAutocomplete
            {...commonAutocompleteProps}
            values={values}
          />
        );
    }
  }
  return null;
};
