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
    | 'noOptionsText'
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
    noOptionsText = 'No options available',
    onChange,
    options = [],
    searchable = false,
    textFieldProps,
    ...rest
  } = props;
  const [inputValue, setInputValue] = React.useState('');

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
        options={
          creatable
            ? options.length === 0
              ? [{ label: 'No options available', value: '' }] // No options at all
              : inputValue && !options.some((opt) => opt.value === inputValue)
              ? [
                  // Has input and it's unique
                  { label: `Create "${inputValue}"`, value: inputValue },
                  ...options,
                ]
              : options // Either no input or input matches existing option
            : options // Not creatable
        }
        renderInput={(params) => (
          <TextField
            {...params}
            {...textFieldProps}
            inputProps={{
              ...params.inputProps,
              ...textFieldProps?.inputProps,
              readOnly: !creatable && !searchable,
            }}
            errorText={props.errorText}
            helperText={props.helperText}
            hideLabel={hideLabel}
            inputId={params.id}
            label={label}
            placeholder={props.placeholder}
            required={props.required}
          />
        )}
        renderOption={(props, option: OptionType) => (
          <li
            {...props}
            className={`${props.className} ${
              option?.value === '' ? 'no-options' : ''
            }`}
          >
            {option?.label}
          </li>
        )}
        disableClearable={!clearable}
        freeSolo={creatable}
        getOptionDisabled={(option: OptionType) => option.value === ''}
        label={label}
        noOptionsText={noOptionsText}
        onChange={handleChange}
        onInputChange={(_, value) => setInputValue(value)}
      />
    </SelectContainer>
  );
};

interface SelectContainerProps extends BoxProps {
  creatable?: boolean;
  searchable?: boolean;
}

const SelectContainer = styled(Box, {
  label: 'SelectWrapper',
  shouldForwardProp: (prop) => prop !== 'creatable' && prop !== 'searchable',
})<SelectContainerProps>(({ creatable, searchable }) => ({
  '& .MuiAutocomplete-option.no-options': {
    opacity: 1,
  },
  '& .MuiInputBase-root, & .MuiInputBase-input': {
    ...(!creatable &&
      !searchable && {
        '&::selection': {
          backgroundColor: 'transparent !important',
        },
        cursor: 'pointer',
      }),
  },
}));
