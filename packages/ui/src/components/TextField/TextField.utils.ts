import { clamp, convertToKebabCase } from '@linode/ui';
import { useId } from 'react';

export const getClampedValue = ({
  max,
  min,
  type,
  value,
}: {
  max?: number;
  min?: number;
  type?: string;
  value: string;
}): number | string => {
  const numberTypes = ['tel', 'number'];

  // Because !!0 is falsy :(
  const minAndMaxExist = typeof min === 'number' && typeof max === 'number';

  if (minAndMaxExist && numberTypes.includes(type || '') && value !== '') {
    return clamp(min, max, +value);
  }

  return value;
};

export const useFieldIds = ({
  errorGroup,
  hasError = false,
  inputId,
  label,
}: {
  errorGroup?: string;
  hasError?: boolean;
  inputId?: string;
  label: string;
}) => {
  const fallbackId = useId();

  const validInputId =
    inputId || (label ? convertToKebabCase(label) : fallbackId);
  const helperTextId = `${validInputId}-helper-text`;
  const errorTextId = `${validInputId}-error-text`;

  const errorScrollClassName = hasError
    ? errorGroup
      ? `error-for-scroll-${errorGroup}`
      : `error-for-scroll`
    : '';

  return {
    errorScrollClassName,
    errorTextId,
    helperTextId,
    validInputId,
  };
};
