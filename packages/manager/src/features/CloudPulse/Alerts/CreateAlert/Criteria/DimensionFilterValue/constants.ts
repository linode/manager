import {
  INTERFACE_IDS_HELPER_TEXT,
  INTERFACE_IDS_PLACEHOLDER_TEXT,
  PORTS_HELPER_TEXT,
} from 'src/features/CloudPulse/Utils/constants';

import {
  CONFIG_HELPER_TEXT,
  CONFIG_ID_PLACEHOLDER_TEXT,
  CONFIGS_HELPER_TEXT,
  CONFIGS_ID_PLACEHOLDER_TEXT,
  INTERFACE_ID_HELPER_TEXT,
  PORT_HELPER_TEXT,
  PORT_PLACEHOLDER_TEXT,
  PORTS_PLACEHOLDER_TEXT,
} from '../../../constants';

import type { Item } from '../../../constants';
import type {
  AlertDefinitionScope,
  CloudPulseServiceType,
  Region,
} from '@linode/api-v4';
import type { AssociatedEntityType } from 'src/features/CloudPulse/shared/types';

export const MULTISELECT_PLACEHOLDER_TEXT = 'Select Values';
export const TEXTFIELD_PLACEHOLDER_TEXT = 'Enter a Value';
export const SINGLESELECT_PLACEHOLDER_TEXT = 'Select a Value';

/**
 * Type definition for the value field renderer props.
 * - 'autocomplete': Renders a select/multi-select dropdown.
 * - 'textfield': Renders a free-form input field.
 */
export type ValueFieldType = 'autocomplete' | 'textfield';

/**
 * Base configuration interface for the Value input components.
 */
export interface BaseConfig {
  /**
   * Specifies which type of input component to render.
   */
  type: ValueFieldType;
}

/**
 * Configuration interface for the TextField-based Value input.
 */
export interface TextFieldConfig extends BaseConfig {
  /**
   * Optional helper text to render below the input field (e.g., hints or constraints).
   */
  helperText?: string;

  /**
   * - 'number': Renders an input that only accepts numeric values.
   * - 'text': Accepts any textual input.
   */
  inputType: 'number' | 'text';

  /**
   * Optional upper bound for numeric inputs (used with inputType: 'number').
   */
  max?: number;

  /**
   * Optional lower bound for numeric inputs (used with inputType: 'number').
   */
  min?: number;

  /**
   * Placeholder text to show in the field before a value is entered.
   */
  placeholder?: string;

  /**
   * Enforces that this config is for a textfield input.
   */
  type: 'textfield';
}

/**
 * Configuration interface for the Autocomplete-based Value input.
 */
export interface AutocompleteConfig extends BaseConfig {
  /**
   * Indicates whether the Autocomplete supports selecting multiple options.
   */
  multiple: boolean;

  /**
   * Optional placeholder to display when no value is selected.
   */
  placeholder?: string;

  /**
   * Enforces that this config is for an autocomplete input.
   */
  type: 'autocomplete';

  /**
   * Flag to use a custom fetch function instead of the static options.
   */
  useCustomFetch?: string | string[];
}

/**
 * Union of configuration types used to dynamically render
 * either a TextField or Autocomplete input component.
 */
export type ValueFieldConfig = AutocompleteConfig | TextFieldConfig;

/**
 * Operator grouping categories used to map to appropriate config.
 */
export type OperatorGroup = '*' | 'eq_neq' | 'in' | 'startswith_endswith';

/**
 * Configuration map that defines the input UI to render
 * based on a given dimension and the operator type.
 */
export type ValueFieldConfigMap = Record<
  string,
  Record<OperatorGroup, ValueFieldConfig>
>;

/**
 * Full config for each dimension, operator group pair.
 */
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
      helperText: PORTS_HELPER_TEXT,
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
      useCustomFetch: ['firewall', 'blockstorage'],
    },
    startswith_endswith: {
      type: 'textfield',
      inputType: 'text',
    },
    in: {
      type: 'autocomplete',
      multiple: true,
      useCustomFetch: ['firewall', 'blockstorage'],
    },
    '*': {
      type: 'textfield',
      inputType: 'text',
    },
  },
  nodebalancer_id: {
    eq_neq: {
      type: 'autocomplete',
      multiple: false,
      useCustomFetch: ['firewall'],
    },
    startswith_endswith: {
      type: 'textfield',
      inputType: 'text',
    },
    in: {
      type: 'autocomplete',
      multiple: true,
      useCustomFetch: ['firewall'],
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
      useCustomFetch: 'firewall',
    },
    startswith_endswith: {
      type: 'textfield',
      placeholder: 'e.g., us-ord',
      inputType: 'text',
    },
    in: {
      type: 'autocomplete',
      multiple: true,
      useCustomFetch: 'firewall',
    },
    '*': {
      type: 'textfield',
      inputType: 'text',
    },
  },
  config_id: {
    eq_neq: {
      type: 'textfield',
      inputType: 'number',
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
      placeholder: CONFIG_ID_PLACEHOLDER_TEXT,
      helperText: CONFIG_HELPER_TEXT,
    },
    startswith_endswith: {
      type: 'textfield',
      inputType: 'number',
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
      placeholder: CONFIG_ID_PLACEHOLDER_TEXT,
      helperText: CONFIG_HELPER_TEXT,
    },
    in: {
      type: 'textfield',
      inputType: 'text',
      placeholder: CONFIGS_ID_PLACEHOLDER_TEXT,
      helperText: CONFIGS_HELPER_TEXT,
    },
    '*': {
      type: 'textfield',
      inputType: 'number',
    },
  },
  interface_id: {
    eq_neq: {
      type: 'textfield',
      inputType: 'number',
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
      placeholder: CONFIG_ID_PLACEHOLDER_TEXT,
      helperText: INTERFACE_ID_HELPER_TEXT,
    },
    startswith_endswith: {
      type: 'textfield',
      inputType: 'number',
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
      placeholder: CONFIG_ID_PLACEHOLDER_TEXT,
      helperText: INTERFACE_ID_HELPER_TEXT,
    },
    in: {
      type: 'textfield',
      inputType: 'text',
      placeholder: INTERFACE_IDS_PLACEHOLDER_TEXT,
      helperText: INTERFACE_IDS_HELPER_TEXT,
    },
    '*': {
      type: 'textfield',
      inputType: 'number',
    },
  },
  vpc_subnet_id: {
    eq_neq: {
      type: 'autocomplete',
      multiple: false,
      useCustomFetch: 'firewall',
    },
    startswith_endswith: {
      type: 'textfield',
      placeholder: 'e.g., VPC-label_subnet-label',
      inputType: 'text',
    },
    in: {
      type: 'autocomplete',
      multiple: true,
      useCustomFetch: 'firewall',
    },
    '*': {
      type: 'textfield',
      inputType: 'text',
    },
  },
  endpoint: {
    eq_neq: {
      type: 'autocomplete',
      multiple: false,
      useCustomFetch: 'objectstorage',
    },
    startswith_endswith: {
      type: 'textfield',
      placeholder: 'e.g., us-east-1.linodeobjects.com',
      inputType: 'text',
    },
    in: {
      type: 'autocomplete',
      multiple: true,
      useCustomFetch: 'objectstorage',
    },
    '*': {
      type: 'textfield',
      inputType: 'text',
    },
  },
  emptyValue: {
    eq_neq: {
      type: 'textfield',
      inputType: 'text',
    },
    startswith_endswith: {
      type: 'textfield',
      inputType: 'text',
    },
    in: {
      type: 'textfield',
      inputType: 'text',
    },
    '*': {
      type: 'textfield',
      inputType: 'text',
    },
  },
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

export interface FetchOptions {
  isError: boolean;
  isLoading: boolean;
  values: Item<string, string>[];
}

export interface FetchOptionsProps {
  /**
   * The type of associated entity to filter on.
   */
  associatedEntityType?: AssociatedEntityType;
  /**
   * The dimension label determines the filtering logic and return type.
   */
  dimensionLabel: null | string;
  /**
   * List of firewall entity IDs to filter on.
   */
  entities?: string[];
  /**
   * List of regions to filter on.
   */
  regions?: Region[];
  /**
   * Scope of fetching: account (all resources) or entity (filtered subset).
   */
  scope?: AlertDefinitionScope | null;
  /**
   * List of user selected regions for region scope.
   */
  selectedRegions?: null | string[];
  /**
   * Service to apply specific transformations to dimension values.
   */
  serviceType?: CloudPulseServiceType | null;
  /**
   * The type of monitoring to filter on.
   */
  type: 'alerts' | 'metrics';
}

export interface DimensionFilterAutocompleteProps {
  /**
   * The current selected dimension label.
   */
  dimensionLabel: null | string;
  /**
   * Whether the autocomplete input should be disabled.
   */
  disabled: boolean;
  /**
   * List of entity IDs selected in the entity scope.
   */
  entities?: string[];
  /**
   * The entity type for firewall filtering (linode or nodebalancer).
   */
  entityType?: AssociatedEntityType;
  /**
   * Optional error message to display beneath the input.
   */
  errorText?: string;
  /**
   * Handler function called on input blur.
   */
  fieldOnBlur: () => void;
  /**
   * Callback triggered when the user selects a new value(s).
   */
  fieldOnChange: (newValue: string | string[]) => void;
  /**
   * Current raw string value (or null) from the form state.
   */
  fieldValue: null | string;
  /**
   * To control single-select/multi-select in the Autocomplete.
   */
  multiple?: boolean;
  /**
   * Name of the field set in the form.
   */
  name: string;
  /**
   * Placeholder text to display when no selection is made.
   */
  placeholderText: string;
  /**
   * Scope of the alert to handle all use-cases.
   */
  scope?: AlertDefinitionScope | null;
  /**
   * List of selected regions under the region scope.
   */
  selectedRegions?: null | string[];
  /**
   * Service type of the alert.
   */
  serviceType: CloudPulseServiceType | null;
  /**
   * The type of monitoring to filter on.
   */
  type: 'alerts' | 'metrics';
  /**
   * The list of pre-defined values for static options.
   */
  values?: null | string[];
}
