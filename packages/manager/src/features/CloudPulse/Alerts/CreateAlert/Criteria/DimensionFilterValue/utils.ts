import { transformDimensionValue } from '../../../Utils/utils';

import type { Item } from '../../../constants';
import type { OperatorGroup } from './constants';
import type {
  CloudPulseServiceType,
  DimensionFilterOperatorType,
} from '@linode/api-v4';

/**
 * Resolves the selected value(s) for the Autocomplete component from raw string.
 * @param options - List of selectable options.
 * @param value - The selected value(s) in raw string format.
 * @param isMultiple - Whether multiple values are allowed.
 * @returns - Matched option(s) for the Autocomplete input.
 */
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

/**
 * Converts selected option(s) from Autocomplete into a raw value string.
 * @param selected - Currently selected value(s) from Autocomplete.
 * @param operation - The triggered Autocomplete action (e.g., 'selectOption').
 * @param isMultiple - Whether multiple selections are enabled.
 * @returns - Comma-separated string or single value.
 */
export const handleValueChange = (
  selected: Item<string, string> | Item<string, string>[] | null,
  operation: string,
  isMultiple: boolean
): string => {
  if (!['removeOption', 'selectOption'].includes(operation)) return '';

  if (isMultiple && Array.isArray(selected)) {
    return selected.map((item) => item.value).join(',');
  }

  if (!isMultiple && selected && !Array.isArray(selected)) {
    return selected.value;
  }

  return '';
};

/**
 * Resolves the operator into a corresponding group key.
 * @param operator - The dimension filter operator.
 * @returns - Mapped operator group used for config lookup.
 */
export const getOperatorGroup = (
  operator: DimensionFilterOperatorType | null
): OperatorGroup => {
  if (operator === 'eq' || operator === 'neq') return 'eq_neq';
  if (operator === 'startswith' || operator === 'endswith')
    return 'startswith_endswith';
  if (operator === 'in') return 'in';
  return '*'; // fallback for null/undefined/other
};

/**
 * Converts a list of raw values to static options for Autocomplete.
 * @param values - List of raw string values.
 * @returns - List of label/value option objects.
 */
export const getStaticOptions = (
  serviceType: CloudPulseServiceType | undefined,
  dimensionLabel: string,
  values: null | string[]
): Item<string, string>[] => {
  return (
    values?.map((val: string) => ({
      label: transformDimensionValue(serviceType ?? null, dimensionLabel, val),
      value: val,
    })) ?? []
  );
};
