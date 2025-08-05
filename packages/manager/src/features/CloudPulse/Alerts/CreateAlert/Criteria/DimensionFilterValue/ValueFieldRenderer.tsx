import { TextField } from '@linode/ui';
import React from 'react';

import {
  MULTISELECT_PLACEHOLDER_TEXT,
  SINGLESELECT_PLACEHOLDER_TEXT,
  TEXTFIELD_PLACEHOLDER_TEXT,
  valueFieldConfig,
} from './constants';
import { DimensionFilterAutocomplete } from './DimensionFilterAutocomplete';
import { useFetchOptions } from './useFetchOptions';
import { getOperatorGroup } from './utils';

import type { DimensionFilterOperatorType } from '@linode/api-v4';

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
   * Optional list of entity IDs used to filter resources like firewalls.
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
   * The currently selected value for the input field.
   */
  value: null | string;

  /**
   * Optional list of pre-defined values, used for static autocomplete options.
   */
  values: null | string[];
}

export const ValueFieldRenderer = (props: ValueFieldRendererProps) => {
  const {
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
  } = props;
  // Use operator group for config lookup
  const operatorGroup = getOperatorGroup(operator);

  const dimensionConfig =
    valueFieldConfig[dimensionLabel ?? '*'] ?? valueFieldConfig['*'];

  const config = dimensionConfig[operatorGroup];
  const items = useFetchOptions({ dimensionLabel, values, entities });
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
    return (
      <DimensionFilterAutocomplete
        disabled={disabled}
        errorText={errorText}
        fieldOnBlur={onBlur}
        fieldOnChange={onChange}
        fieldValue={value}
        multiple={config.multiple}
        name={name}
        placeholderText={config.placeholder ?? autocompletePlaceholder}
        values={items}
      />
    );
  }

  return null;
};
