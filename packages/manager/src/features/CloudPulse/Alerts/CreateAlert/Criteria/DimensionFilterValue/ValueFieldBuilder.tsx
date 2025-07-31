import { TextField } from '@linode/ui';
import React from 'react';

import {
  getOperatorGroup,
  MULTISELECT_PLACEHOLDER_TEXT,
  SINGLESELECT_PLACEHOLDER_TEXT,
  TEXTFIELD_PLACEHOLDER_TEXT,
  valueFieldConfig,
} from './constants';
import { DimensionFilterAutocomplete } from './DimensionFilterAutocomplete';
import { useFetchOptions } from './useFetchOptions';

import type { DimensionFilterOperatorType } from '@linode/api-v4';

interface ValueFieldBuilderProps {
  dimensionLabel: null | string;
  disabled: boolean;
  entities?: string[];
  errorText: string | undefined;
  onBlur: () => void;
  onChange: (value: string | string[]) => void;
  operator: DimensionFilterOperatorType | null;
  value: null | string;
  values: null | string[];
}

export const ValueFieldBuilder: React.FC<ValueFieldBuilderProps> = ({
  entities,
  disabled,
  dimensionLabel,
  operator,
  values,
  value,
  onChange,
  onBlur,
  errorText,
}) => {
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
        sx={{ flex: 1, minWdth: '256px', maxWidth: '300px', width: '277px' }}
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
        placeholderText={config.placeholder ?? autocompletePlaceholder}
        values={items}
      />
    );
  }

  return null;
};
