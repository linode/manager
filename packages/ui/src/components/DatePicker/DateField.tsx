import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateField as MUIDateField } from '@mui/x-date-pickers/DateField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React from 'react';

import { convertToKebabCase } from '../../utilities';
import { Box } from '../Box/Box';
import { FormHelperText } from '../FormHelperText';
import { InputLabel } from '../InputLabel/InputLabel';

import type { SxProps, Theme } from '@mui/material/styles';
import type { DateFieldProps as MUIDateFieldProps } from '@mui/x-date-pickers/DateField';
import type { DateTime } from 'luxon';

interface DateFieldProps
  extends Omit<MUIDateFieldProps<DateTime>, 'onChange' | 'value'> {
  errorText?: string;
  format?: 'dd-MM-yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
  inputRef?: React.RefObject<HTMLInputElement>;
  label: string;
  onChange: (date: DateTime | null) => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  sx?: SxProps<Theme>;
  value: DateTime | null;
}

export const DateField = ({
  errorText,
  format = 'yyyy-MM-dd',
  inputRef,
  label,
  onChange,
  onClick,
  sx,
  value,
  ...rest
}: DateFieldProps) => {
  const fallbackId = React.useId();
  const validInputId = label ? convertToKebabCase(label) : fallbackId;
  const errorTextId = `${validInputId}-error-text`;

  const handleChange = (newValue: DateTime | null) => {
    if (newValue?.isValid) {
      onChange(newValue);
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
        <MUIDateField
          format={format}
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
          {...rest}
        />
        {errorText && (
          <FormHelperText
            id={errorTextId}
            role="alert"
            sx={{
              color: (theme: Theme) => theme.palette.error.dark,
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
