import { TextField } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React from 'react';

import type { TextFieldProps } from '@linode/ui';
import type { DatePickerProps as MuiDatePickerProps } from '@mui/x-date-pickers/DatePicker';
import type { DateTime } from 'luxon';

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
  onChange: (newDate: DateTime | null) => void;
  /** Placeholder text for the date picker input */
  placeholder?: string;
  /** Additional props to pass to the underlying TextField component */
  textFieldProps?: Omit<TextFieldProps, 'onChange' | 'value'>;
  /** The currently selected date */
  value?: DateTime | null;
}

export const DatePicker = ({
  format = 'yyyy-MM-dd',
  helperText = '',
  label = 'Select a date',
  onChange,
  placeholder = 'Pick a date',
  textFieldProps,
  value = null,
  ...props
}: DatePickerProps) => {
  const theme = useTheme();

  const onChangeHandler = (newDate: DateTime | null) => {
    onChange(newDate);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <MuiDatePicker
        format={format}
        onChange={onChangeHandler}
        reduceAnimations // disables the rendering animation
        value={value}
        {...props}
        slotProps={{
          // TODO: Move styling customization to global theme styles.
          popper: {
            sx: {
              '& .MuiDayCalendar-weekDayLabel': {
                fontSize: '0.875rem',
              },
              '& .MuiPickersCalendarHeader-label': {
                fontWeight: 'bold',
              },
              '& .MuiPickersCalendarHeader-root': {
                fontSize: '0.875rem',
              },
              '& .MuiPickersDay-root': {
                fontSize: '0.875rem',
                margin: `${theme.spacing(0.5)}px`,
              },
              backgroundColor: theme.bg.main,
              borderRadius: `${theme.spacing(2)}`,
              boxShadow: `0px 4px 16px ${theme.color.boxShadowDark}`,
            },
          },
          textField: {
            ...textFieldProps,
            helperText,
            label,
            placeholder,
          },
        }}
        slots={{
          textField: TextField,
        }}
      />
    </LocalizationProvider>
  );
};
