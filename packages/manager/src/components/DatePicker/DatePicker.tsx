import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React, { useState } from 'react';

import { TextField } from 'src/components/TextField';

import type { DateTime } from 'luxon';
import type { TextFieldProps } from 'src/components/TextField';

interface DatePickerProps {
  /** If true, disables selecting future dates. Defaults to false. */
  disableFuture?: boolean;
  /** If true, disables selecting past dates. Defaults to false. */
  disablePast?: boolean;
  /** Error text to display below the input */
  errorText?: string;
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
  disableFuture = false,
  disablePast = false,
  errorText,
  helperText,
  label = 'Select a date',
  onChange,
  placeholder = 'Select a date',
  textFieldProps,
  value,
  ...props
}: DatePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(
    value || null
  );

  const onChangeHandler = (newDate: DateTime | null) => {
    setSelectedDate(newDate);
    if (onChange) {
      onChange(newDate);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <MuiDatePicker
        disableFuture={disableFuture}
        disablePast={disablePast}
        label={label}
        onChange={onChangeHandler}
        value={selectedDate}
        {...props}
        // Customize the TextField using slotProps for the default MUI TextField
        slotProps={{
          textField: {
            component: (inputProps) => (
              <TextField
                {...inputProps}
                error={Boolean(errorText)}
                helperText={helperText}
                placeholder={placeholder}
                {...textFieldProps}
              />
            ),
          },
        }}
      />
    </LocalizationProvider>
  );
};
