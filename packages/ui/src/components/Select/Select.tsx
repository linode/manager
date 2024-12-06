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
  /**
   * Whether the select can be cleared once a value is selected.
   *
   * @default false
   */
  clearable?: boolean;
  /**
   * Whether the select can create a new option.
   * This will enable the freeSolo prop on the Autocomplete component.
   *
   * @default false
   */
  creatable?: boolean;
  /**
   * Whether to visually hide the label, which is still required for accessibility.
   *
   * @default false
   */
  hideLabel?: boolean;
  /**
   * The label for the select.
   */
  label: string;
  /**
   * The callback function that is invoked when the value changes.
   */
  onChange?: (_event: React.SyntheticEvent, _value: OptionType | null) => void;
  /**
   * Whether the select is required.
   *
   * @default false
   */
  required?: boolean;
  /**
   * Whether the select is searchable.
   *
   * @default false
   */
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
