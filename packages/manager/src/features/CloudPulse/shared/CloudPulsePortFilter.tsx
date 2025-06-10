import { TextField } from '@linode/ui';
import React from 'react';
import { debounce } from 'throttle-debounce';

import {
  PORT,
  PORTS_ERROR_MESSAGE,
  PORTS_HELPER_TEXT,
} from '../Utils/constants';
import { arePortsValid } from '../Utils/utils';

import type { Dashboard, FilterValue } from '@linode/api-v4';

export interface CloudPulsePortFilterProps {
  /**
   * The dashboard object
   */
  dashboard: Dashboard;

  /**
   * The last saved value for the port filter from preferences
   */
  defaultValue?: FilterValue;

  /**
   * The function to handle the port change
   */
  handlePortChange: (port: string, label: string[], savePref?: boolean) => void;

  /**
   * The label for the port filter
   */
  label: string;

  /**
   * The placeholder for the port filter
   */
  placeholder?: string;

  /**
   * The boolean to determine if the preferences should be saved
   */
  savePreferences: boolean;
}

export const CloudPulsePortFilter = React.memo(
  (props: CloudPulsePortFilterProps) => {
    const {
      label,
      placeholder,
      handlePortChange,
      savePreferences,
      defaultValue,
    } = props;

    const [value, setValue] = React.useState<string>(
      (defaultValue as string) || ''
    );
    const [errorText, setErrorText] = React.useState<string | undefined>(
      undefined
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = ['ArrowLeft', 'ArrowRight', 'Tab'];

      if (allowedKeys.includes(e.key)) {
        setErrorText(undefined);
        return;
      }

      const selectionStart = (e.target as HTMLInputElement).selectionStart ?? 0;
      const selectionEnd = (e.target as HTMLInputElement).selectionEnd ?? 0;
      let newValue;

      // Calculate new value based on key type
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectionStart > 0) {
          newValue =
            value.substring(0, selectionStart - 1) +
            value.substring(selectionStart);
        } else {
          return;
        }
      } else {
        if (/^[\d,]$/.test(e.key)) {
          newValue =
            value.substring(0, selectionStart) +
            e.key +
            value.substring(selectionEnd);
        } else {
          e.preventDefault();
          setErrorText(PORTS_ERROR_MESSAGE);
          return;
        }
      }

      // Check if each segment (split by comma) is a valid port
      const allValid = arePortsValid(newValue);
      if (!allValid.isValid) {
        e.preventDefault();
        setErrorText(allValid.errorMsg);
        return;
      }

      setErrorText(undefined);
    };

    // Only call handlePortChange if the user has stopped typing for 5 seconds
    const debouncedPortChange = React.useMemo(
      () =>
        debounce(500, (value: string) => {
          handlePortChange(value, [PORT], savePreferences);
        }),
      [handlePortChange, savePreferences]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);

      // Validate and handle the change
      const validationResult = arePortsValid(e.target.value);
      if (validationResult.isValid) {
        debouncedPortChange(e.target.value);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const validationResult = arePortsValid(e.target.value);
      setErrorText(validationResult.errorMsg);
    };

    return (
      <TextField
        autoComplete="off"
        errorText={errorText}
        helperText={!errorText ? PORTS_HELPER_TEXT : undefined}
        label={label}
        noMarginTop
        onBlur={handleBlur}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'e.g., 80,443,3000'}
        value={value}
      />
    );
  }
);
