import {
  PORT_HELPER_TEXT,
  PORT_PLACEHOLDER_TEXT,
  PORTS_PLACEHOLDER_TEXT,
} from '../../../constants';

import type { Item } from '../../../constants';
import type { DimensionFilterOperatorType } from '@linode/api-v4';

export const MULTISELECT_PLACEHOLDER_TEXT = 'Select values';
export const TEXTFIELD_PLACEHOLDER_TEXT = 'Enter a value';
export const SINGLESELECT_PLACEHOLDER_TEXT = 'Select a value';

export const resolveSelectedValues = (
  options: Item<string, string>[],
  value: null | string,
  isMultiple: boolean
): Item<string, string> | Item<string, string>[] | null => {
  if (!value) return isMultiple ? [] : null;

  if (isMultiple) {
    return options.filter((option) => value.split(',').includes(option.value));
  }

  return options.find((option) => option.value === value) ?? null;
};

export const handleValueChange = (
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

export type FieldType = 'autocomplete' | 'textfield';

export interface BaseConfig {
  type: 'autocomplete' | 'textfield';
}
export interface TextFieldConfig extends BaseConfig {
  helperText?: string;
  inputType: 'number' | 'text';
  max?: number;
  min?: number;
  placeholder?: string;
  type: 'textfield';
}

export interface AutocompleteConfig extends BaseConfig {
  multiple: boolean;
  placeholder?: string;
  type: 'autocomplete';
}

export type ValueFieldConfig = AutocompleteConfig | TextFieldConfig;

export type DimensionLabel = '*' | 'linode_id' | 'port' | 'region_id';

export type ValueFieldConfigMap = Record<
  string,
  Record<OperatorGroup, ValueFieldConfig>
>;

type OperatorGroup = '*' | 'eq_neq' | 'in' | 'startswith_endswith';

export const valueFieldConfig: ValueFieldConfigMap = {
  port: {
    eq_neq: {
      type: 'textfield',
      inputType: 'number',
      placeholder: PORT_PLACEHOLDER_TEXT,
      min: 1,
      max: 65535,
      helperText: PORT_HELPER_TEXT,
    },
    startswith_endswith: {
      type: 'textfield',
      inputType: 'number',
      placeholder: PORT_PLACEHOLDER_TEXT,
      helperText: PORT_HELPER_TEXT,
      min: 1,
      max: 65535,
    },
    in: {
      type: 'textfield',
      inputType: 'text',
      placeholder: PORTS_PLACEHOLDER_TEXT,
      helperText: PORT_HELPER_TEXT,
    },
    '*': {
      type: 'textfield',
      inputType: 'number',
    },
  },
  linode_id: {
    eq_neq: {
      type: 'autocomplete',
      multiple: false,
    },
    startswith_endswith: {
      type: 'textfield',
      inputType: 'text',
    },
    in: {
      type: 'autocomplete',
      multiple: true,
    },
    '*': {
      type: 'textfield',
      inputType: 'text',
    },
  },
  region_id: {
    eq_neq: {
      type: 'autocomplete',
      multiple: false,
    },
    startswith_endswith: {
      type: 'textfield',
      inputType: 'text',
    },
    in: {
      type: 'autocomplete',
      multiple: true,
    },
    '*': {
      type: 'textfield',
      inputType: 'text',
    },
  },
  // fallback for any dimension with values
  '*': {
    eq_neq: {
      type: 'autocomplete',
      multiple: false,
    },
    startswith_endswith: {
      type: 'textfield',
      inputType: 'text',
    },
    in: {
      type: 'autocomplete',
      multiple: true,
    },
    '*': {
      type: 'textfield',
      inputType: 'text',
    },
  },
};

export const getOperatorGroup = (
  operator: DimensionFilterOperatorType | null
): OperatorGroup => {
  if (operator === 'eq' || operator === 'neq') return 'eq_neq';
  if (operator === 'startswith' || operator === 'endswith')
    return 'startswith_endswith';
  if (operator === 'in') return 'in';
  return '*'; // fallback for null/undefined/other
};
