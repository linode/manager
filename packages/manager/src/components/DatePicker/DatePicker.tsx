import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React from 'react';

import { TextField } from 'src/components/TextField';

import type { DatePickerProps as MuiDatePickerProps } from '@mui/x-date-pickers/DatePicker';
import type { DateTime } from 'luxon';
import type { TextFieldProps } from 'src/components/TextField';

export interface DatePickerProps
  extends Omit<MuiDatePickerProps<DateTime>, 'onChange' | 'value'> {
  /** Error text to display below the input */
  errorText?: string;
  /** Format of the date when rendered in the input field. */
  format?: string;
  /** Helper text to display below the input */
  helperText?: string;
  /** Label to display for the date picker input */
  label?: string;
  /** Callback function fired when the value changes */
  onChange?: (newDate: DateTime | null) => void;
  /** Placeholder text for the date picker input */
  placeholder?: string;
  /** Additional props to pass to the underlying TextField component */
  textFieldProps?: Omit<TextFieldProps, 'onChange' | 'value'>;
  /** The currently selected date */
  value?: DateTime | null;
}

export const DatePicker = ({
  errorText,
  format = 'yyyy-MM-dd',
  helperText = '',
  label = 'Select a date',
  onChange,
  placeholder = 'Pick a date',
  textFieldProps,
  value = null,
  ...props
}: DatePickerProps) => {
  const onChangeHandler = (newDate: DateTime | null) => {
    if (onChange) {
      onChange(newDate);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <MuiDatePicker
        format={format}
        onChange={onChangeHandler}
        value={value}
        {...props}
        slotProps={{
          textField: {
            ...textFieldProps,
            InputProps: {
              ...textFieldProps?.InputProps,
            },
            error: Boolean(errorText),
            helperText,
            label,
            placeholder,
          },
        }}
        slots={{
          textField: TextField, // Use custom TextField
        }}
      />
    </LocalizationProvider>
  );
};
