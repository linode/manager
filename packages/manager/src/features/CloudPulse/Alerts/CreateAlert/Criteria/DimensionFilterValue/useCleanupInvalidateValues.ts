// useCleanupInvalidValues.ts
import { useEffect } from 'react';

import type { Item } from '../../../constants';

/**
 * Cleans up stale form values that are no longer in the options list.
 */
export const useCleanupInvalidValues = ({
  options,
  fieldValue,
  multiple,
  onChange,
  isLoading,
}: {
  fieldValue: null | string | string[];
  isLoading?: boolean;
  multiple?: boolean;
  onChange: (value: null | string | string[]) => void;
  options: Item<string, string>[];
}) => {
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
      return;
    }

    const validValues = options.map((o) => o.value);

    if (multiple) {
      const isArray = Array.isArray(fieldValue);
      const selected = isArray
        ? fieldValue
        : fieldValue.split(',').filter((v) => v.trim() !== '');

      const filtered = selected.filter((v) => validValues.includes(v));

      if (filtered.length !== selected.length) {
        onChange(isArray ? filtered : filtered.join(','));
      }
    } else {
      const value = Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;

      if (value) {
        const isStillValid = validValues.includes(value);
        if (!isStillValid) {
          onChange(null);
        }
      }
    }
  }, [options, fieldValue, multiple, onChange, isLoading]);
};
