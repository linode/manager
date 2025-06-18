import { TextField } from '@linode/ui';
import React from 'react';
import { debounce } from 'throttle-debounce';

import { PORTS_HELPER_TEXT } from '../Utils/constants';
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

    // Only call handlePortChange if the user has stopped typing for 0.5 seconds
    const debouncedPortChange = React.useMemo(
      () =>
        debounce(500, (value: string) => {
          handlePortChange(value, [value], savePreferences);
        }),
      [handlePortChange, savePreferences]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);

      // Validate and handle the change
      const validationError = arePortsValid(e.target.value);
      setErrorText(validationError);
      if (validationError === undefined) {
        debouncedPortChange(e.target.value);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const validationError = arePortsValid(e.target.value);
      setErrorText(validationError);
      if (validationError === undefined) {
        handlePortChange(e.target.value, [e.target.value], savePreferences);
      }
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
        optional
        placeholder={placeholder ?? 'e.g., 80,443,3000'}
        value={value}
      />
    );
  }
);
