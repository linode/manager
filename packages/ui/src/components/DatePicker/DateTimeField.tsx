import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTimeField as MUIDateTimeField } from '@mui/x-date-pickers/DateTimeField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React from 'react';

import { convertToKebabCase } from '../../utilities';
import { Box } from '../Box/Box';
import { FormHelperText } from '../FormHelperText';
import { InputLabel } from '../InputLabel/InputLabel';

import type { SxProps, Theme } from '@mui/material/styles';
import type { DateTimeFieldProps as MUIDateTimeFieldProps } from '@mui/x-date-pickers/DateTimeField';
import type { DateTime } from 'luxon';

interface DateTimeFieldProps
  extends Omit<MUIDateTimeFieldProps<DateTime>, 'onChange' | 'value'> {
  errorText?: string;
  format?:
    | 'MM/dd/yyyy HH:mm'
    | 'MM/dd/yyyy hh:mm a'
    | 'dd-MM-yyyy HH:mm'
    | 'dd-MM-yyyy hh:mm a'
    | 'yyyy-MM-dd HH:mm'
    | 'yyyy-MM-dd hh:mm a';
  inputRef?: React.RefObject<HTMLInputElement>;
  label: string;
  onChange: (date: DateTime | null) => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  sx?: SxProps<Theme>;
  value: DateTime | null;
}

export const DateTimeField = ({
  errorText,
  format = 'yyyy-MM-dd hh:mm a', // Default format includes time
  inputRef,
  label,
  onChange,
  onClick,
  sx,
  value,
  ...rest
}: DateTimeFieldProps) => {
  const fallbackId = React.useId();

  const validInputId = label ? convertToKebabCase(label) : fallbackId;
  const errorTextId = `${validInputId}-error-text`;

  const handleChange = (newValue: DateTime | null) => {
    if (newValue?.isValid) {
      onChange(newValue); // Ensure full DateTime value (date + time) is passed
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Box display="flex" flexDirection="column" sx={sx}>
        <InputLabel
          sx={{
            marginBottom: 0,
            transform: 'none',
          }}
          htmlFor={validInputId}
        >
          {label}
        </InputLabel>
        <MUIDateTimeField
          inputProps={{
            'aria-errormessage': errorText ? errorTextId : undefined,
            'aria-invalid': Boolean(errorText),
            'aria-labelledby': validInputId,
            id: validInputId,
            onClick,
          }}
          slotProps={{
            textField: {
              InputLabelProps: { shrink: true },
              error: Boolean(errorText),
              helperText: '',
            },
          }}
          format={format}
          inputRef={inputRef}
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
