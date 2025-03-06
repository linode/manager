import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';
import React from 'react';

import { convertToKebabCase } from '../../utilities';
import { Box } from '../Box/Box';
import { FormHelperText } from '../FormHelperText';
import { InputLabel } from '../InputLabel/InputLabel';

import type { SxProps, Theme } from '@mui/material/styles';
import type { TimePickerProps as MUITimePickerProps } from '@mui/x-date-pickers/TimePicker';
import type { DateTime } from 'luxon';

interface TimePickerProps
  extends Omit<
    MUITimePickerProps<DateTime>,
    'onChange' | 'renderInput' | 'value'
  > {
  errorText?: string;
  format?: 'HH:mm' | 'hh:mm a'; // 24-hour or 12-hour format
  inputRef?: React.RefObject<HTMLInputElement>;
  label: string;
  onChange: (time: DateTime | null) => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  sx?: SxProps; // Accepts MUI sx for styling
  value: DateTime | null;
}

export const TimePicker = ({
  errorText,
  format = 'hh:mm a', // Default format
  inputRef,
  label,
  onChange,
  onClick,
  sx,
  value,
  ...rest
}: TimePickerProps) => {
  const fallbackId = React.useId();
  const validInputId = label ? convertToKebabCase(label) : fallbackId;
  const errorTextId = `${validInputId}-error-text`;

  const handleChange = (newTime: DateTime | null) => {
    if (newTime?.isValid) {
      onChange(newTime);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Box display="flex" flex="1" flexDirection="column" sx={sx}>
        <InputLabel
          sx={{
            marginBottom: 0,
            transform: 'none',
          }}
          htmlFor={validInputId}
        >
          {label}
        </InputLabel>
        <MuiTimePicker
          slotProps={{
            actionBar: {
              sx: (theme: Theme) => ({
                justifyContent: 'center',
                marginBottom: theme.spacing(0.5),
                marginTop: theme.spacing(0.5),
                padding: 0,
              }),
            },
            layout: {
              sx: (theme: Theme) => ({
                '& .MuiPickersLayout-contentWrapper': {
                  borderBottom: `1px solid ${theme.tokens.calendar.Border}`,
                },
                border: `1px solid ${theme.tokens.calendar.Border}`,
              }),
            },
            openPickerButton: {
              sx: { padding: 0 },
            },
            popper: {
              sx: (theme: Theme) => ({
                ul: {
                  borderColor: `${theme.tokens.calendar.Border} !important`,
                },
              }),
            },
            textField: {
              InputLabelProps: { shrink: true },
              error: Boolean(errorText),
              helperText: '',
              id: validInputId,
              inputRef,
              onClick,
            },
          }}
          ampm={format === 'hh:mm a'} // Toggle 12-hour or 24-hour format
          onChange={handleChange}
          sx={{ marginTop: 1 }}
          value={value}
          {...rest}
        />
        {errorText && (
          <FormHelperText
            sx={{
              color: (theme: Theme) => theme.palette.error.dark,
              marginTop: '4px',
            }}
            id={errorTextId}
            role="alert"
          >
            {errorText}
          </FormHelperText>
        )}
      </Box>
    </LocalizationProvider>
  );
};
