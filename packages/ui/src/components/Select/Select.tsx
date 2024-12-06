import { styled } from '@mui/material';
import React from 'react';

import { Autocomplete } from '../Autocomplete';
import { Box } from '../Box';
import { TextField } from '../TextField';

import type { EnhancedAutocompleteProps } from '../Autocomplete';
import type { BoxProps } from '../Box';

type OptionType = { label: string; value: string };

export interface SelectProps
  extends Pick<
    EnhancedAutocompleteProps<OptionType>,
    | 'errorText'
    | 'helperText'
    | 'loading'
    | 'options'
    | 'placeholder'
    | 'textFieldProps'
    | 'value'
  > {
  clearable?: boolean;
  creatable?: boolean;
  hideLabel?: boolean;
  label: string;
  onChange?: (_event: React.SyntheticEvent, _value: OptionType | null) => void;
  required?: boolean;
  searchable?: boolean;
}

/**
 * An abstracted Autocomplete component with a limited set of props.
 * This component is meant to be used when wanting:
 * - A simple select without search ability
 * - A create-able select
 *
 * For any other use-cases, use the Autocomplete component directly.
 */
export const Select = (props: SelectProps) => {
  const {
    clearable = false,
    creatable = false,
    hideLabel = false,
    label,
    onChange,
    searchable = false,
    textFieldProps,
    ...rest
  } = props;

  const handleChange = (
    event: React.SyntheticEvent,
    value: OptionType | null | string
  ) => {
    if (creatable && typeof value === 'string') {
      onChange?.(event, {
        label: value,
        value: value.toLowerCase().replace(/\s+/g, '-'),
      });
    } else {
      onChange?.(event, value as OptionType | null);
    }
  };

  return (
    <SelectContainer creatable={creatable}>
      <Autocomplete
        {...rest}
        renderInput={
          creatable
            ? (params) => (
                <TextField
                  {...params}
                  {...textFieldProps}
                  errorText={props.errorText}
                  helperText={props.helperText}
                  hideLabel={hideLabel}
                  inputId={params.id}
                  label={label}
                  placeholder={props.placeholder}
                  required={props.required}
                />
              )
            : undefined
        }
        textFieldProps={
          !creatable
            ? {
                ...textFieldProps,
                InputProps: {
                  ...textFieldProps?.InputProps,
                  required: props.required,
                },
                hideLabel,
                inputProps: {
                  ...textFieldProps?.inputProps,
                  readOnly: !searchable,
                },
              }
            : undefined
        }
        disableClearable={!clearable}
        freeSolo={creatable}
        label={label}
        onChange={handleChange}
      />
    </SelectContainer>
  );
};

interface SelectContainerProps extends BoxProps {
  creatable?: boolean;
}

const SelectContainer = styled(Box)<SelectContainerProps>(({ creatable }) => ({
  '& .MuiInputBase-root, & .MuiInputBase-input': {
    ...(!creatable && {
      '&::selection': {
        backgroundColor: 'transparent !important',
      },
    }),
    cursor: 'pointer',
  },
}));
