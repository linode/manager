import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTimeField as _DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React from 'react';

import { convertToKebabCase } from '../../utilities';
import { Box } from '../Box/Box';
import { FormHelperText } from '../FormHelperText';
import { InputLabel } from '../InputLabel/InputLabel';

import type { Theme } from '@mui/material/styles';
import type { DateTime } from 'luxon';

interface DateTimeFieldProps {
  errorText?: string;
  handleClose: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  label: string;
  onChange: (date: DateTime | null) => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  //   otherFieldRef: React.RefObject<HTMLInputElement>;
  placeholder?: string;
  value: DateTime | null;
}

export const DateTimeField = ({
  errorText,
  inputRef,
  label,
  onChange,
  onClick,
  placeholder,
  value,
}: DateTimeFieldProps) => {
  const fallbackId = React.useId();

  const validInputId = label ? convertToKebabCase(label) : fallbackId;
  const errorTextId = `${validInputId}-error-text`;

  const handleChange = (newValue: DateTime | null) => {
    if (newValue?.isValid) {
      onChange(newValue.startOf('day'));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Box display="flex" flexDirection="column">
        <InputLabel
          sx={{
            marginBottom: 0,
            transform: 'none',
          }}
          htmlFor={validInputId}
        >
          {label}
        </InputLabel>
        <_DateTimeField
          inputProps={{
            'aria-errormessage': errorText ? errorTextId : undefined,
            'aria-invalid': Boolean(errorText),
            'aria-labelledby': validInputId,
            id: validInputId,
            onClick,
            placeholder,
          }}
          slotProps={{
            textField: {
              InputLabelProps: { shrink: true },
              error: Boolean(errorText),
              helperText: '',
            },
          }}
          format="MM/dd/yyyy"
          inputRef={inputRef}
          onChange={handleChange}
          sx={{ marginTop: 1 }}
          value={value}
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
