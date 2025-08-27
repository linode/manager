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
    | 'dd-MM-yyyy HH:mm'
    | 'dd-MM-yyyy hh:mm a'
    | 'MM/dd/yyyy HH:mm'
    | 'MM/dd/yyyy hh:mm a'
    | 'yyyy-MM-dd HH:mm'
    | 'yyyy-MM-dd hh:mm a';
  inputRef?: React.RefObject<HTMLInputElement | null>;
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
          htmlFor={validInputId}
          sx={{
            marginBottom: 0,
            transform: 'none',
          }}
        >
          {label}
        </InputLabel>
        <MUIDateTimeField
          format={format}
          // TODO: MUI bug - slotProps.htmlInput doesn't work for DateTimeField
          // Using deprecated inputProps until MUI fixes their implementation
          inputProps={{
            'aria-errormessage': errorText ? errorTextId : undefined,
            'aria-invalid': Boolean(errorText),
            'aria-labelledby': validInputId,
            id: validInputId,
            onClick,
          }}
          inputRef={inputRef}
          onChange={handleChange}
          slotProps={{
            textField: {
              InputLabelProps: { shrink: true },
              error: Boolean(errorText),
              helperText: '',
            },
          }}
          sx={{ marginTop: 1 }}
          value={value}
          variant="standard"
          {...rest}
        />
        {errorText && (
          <FormHelperText
            error
            id={errorTextId}
            role="alert"
            sx={{
              marginTop: '4px',
            }}
          >
            {errorText}
          </FormHelperText>
        )}
      </Box>
    </LocalizationProvider>
  );
};
