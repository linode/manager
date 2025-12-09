import { TextField } from '@linode/ui';
import React from 'react';
import { debounce } from 'throttle-debounce';

import { HELPER_TEXT, PLACEHOLDER_TEXT } from '../Utils/constants';
import { validationFunction } from '../Utils/utils';

import type { FilterValue } from '@linode/api-v4';

export interface CloudPulseTextFilterProps {
  /**
   * The last saved value for the text filter from preferences
   */
  defaultValue?: FilterValue;

  /**
   * The boolean to determine if the filter is disabled
   */
  disabled?: boolean;

  /**
   * The filter key
   */
  filterKey: string;

  /**
   * The function to handle the text filter change
   */
  handleTextFilterChange: (
    port: string,
    label: string[],
    filterKey: string,
    savePref?: boolean
  ) => void;

  /**
   * The label for the text filter
   */
  label: string;

  /**
   * The boolean to determine if the filter is optional
   */
  optional?: boolean;

  /**
   * The placeholder for the text filter
   */
  placeholder?: string;

  /**
   * The boolean to determine if the preferences should be saved
   */
  savePreferences: boolean;
}

export const CloudPulseTextFilter = React.memo(
  (props: CloudPulseTextFilterProps) => {
    const {
      label,
      placeholder,
      handleTextFilterChange,
      savePreferences,
      defaultValue,
      disabled,
      filterKey,
      optional,
    } = props;

    const [value, setValue] = React.useState<string>(
      typeof defaultValue === 'string' ? defaultValue : ''
    );
    const [errorText, setErrorText] = React.useState<string | undefined>(
      undefined
    );
    const validate = validationFunction[filterKey];

    // Initialize filterData on mount if there's a default value
    React.useEffect(() => {
      if (defaultValue && typeof defaultValue === 'string') {
        handleTextFilterChange(defaultValue, [defaultValue], filterKey);
      }
    }, [defaultValue, handleTextFilterChange, filterKey, savePreferences]);

    // Only call handleTextFilterChange if the user has stopped typing for 0.5 seconds
    const debouncedTextFilterChange = React.useMemo(
      () =>
        debounce(500, (value: string) => {
          handleTextFilterChange(value, [value], filterKey, savePreferences);
        }),
      [filterKey, handleTextFilterChange, savePreferences]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);

      // Validate and handle the change
      const validationError = validate(e.target.value);
      setErrorText(validationError);
      if (validationError === undefined) {
        debouncedTextFilterChange(e.target.value);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const validationError = validate(e.target.value);
      setErrorText(validationError);
      if (validationError === undefined) {
        handleTextFilterChange(
          e.target.value,
          [e.target.value],
          filterKey,
          savePreferences
        );
      }
    };

    return (
      <TextField
        autoComplete="off"
        disabled={disabled}
        errorText={errorText}
        helperText={!errorText ? HELPER_TEXT[filterKey] : undefined}
        label={label}
        noMarginTop
        onBlur={handleBlur}
        onChange={handleInputChange}
        optional={optional ?? false}
        placeholder={placeholder ?? PLACEHOLDER_TEXT[filterKey]}
        value={value}
      />
    );
  }
);
