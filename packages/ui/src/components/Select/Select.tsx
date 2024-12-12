import React from 'react';

import { Autocomplete } from '../Autocomplete';
import { CircleProgress } from '../CircleProgress';
import { InputAdornment } from '../InputAdornment';
import { ListItem } from '../ListItem';
import { TextField } from '../TextField';

import type { EnhancedAutocompleteProps } from '../Autocomplete';

export type SelectOptionType = {
  label: string;
  value: string;
};

interface InternalOptionType extends SelectOptionType {
  create?: boolean;
  noOptions?: boolean;
}
export interface SelectProps
  extends Pick<
    EnhancedAutocompleteProps<SelectOptionType>,
    | 'errorText'
    | 'helperText'
    | 'isOptionEqualToValue'
    | 'loading'
    | 'noOptionsText'
    | 'onBlur'
    | 'options'
    | 'placeholder'
    | 'textFieldProps'
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
  onChange?: (
    _event: React.SyntheticEvent,
    _value: SelectProps['value']
  ) => void;
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
  /**
   * The value of the select.
   * We ensure that when passing in a value, it is never undefined. (to prevent controlled/uncontrolled input issues)
   */
  value: SelectOptionType | null;
}

/**
 * An abstracted Autocomplete component with a limited set of props.
 * Meant to be used when needing:
 * - A simple select
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
    loading = false,
    noOptionsText = 'No options available',
    onChange,
    options,
    searchable = false,
    textFieldProps,
    ...rest
  } = props;
  const [inputValue, setInputValue] = React.useState('');

  const handleChange = (
    event: React.SyntheticEvent,
    value: SelectProps['value'] | string
  ) => {
    if (creatable && typeof value === 'string') {
      onChange?.(event, {
        label: value,
        value,
      });
    } else if (value && typeof value === 'object' && 'label' in value) {
      const { label, value: optionValue } = value;
      onChange?.(event, {
        label,
        value: optionValue,
      });
    } else {
      onChange?.(event, null);
    }
  };

  const selectedOptions = React.useMemo(
    () => getOptions({ creatable, inputValue, options }),
    [creatable, inputValue, options]
  );

  return (
    <Autocomplete
      {...rest}
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
          InputProps={{
            ...params.InputProps,
            ...textFieldProps?.InputProps,
            endAdornment: (
              <>
                {loading && (
                  <InputAdornment position="end">
                    <CircleProgress size="sm" />
                  </InputAdornment>
                )}
                {textFieldProps?.InputProps?.endAdornment}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
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
      renderOption={(props, option: InternalOptionType) => {
        const { key, ...rest } = props;
        return (
          <ListItem
            {...rest}
            sx={
              option.noOptions
                ? {
                    opacity: '1 !important',
                  }
                : null
            }
            key={key}
          >
            {option.create ? (
              <>
                <strong>Create&nbsp;</strong> &quot;{option.label}&quot;
              </>
            ) : (
              option.label
            )}
          </ListItem>
        );
      }}
      disableClearable={!clearable}
      forcePopupIcon
      freeSolo={creatable}
      getOptionDisabled={(option: SelectOptionType) => option.value === ''}
      label={label}
      noOptionsText={noOptionsText}
      onChange={handleChange}
      onInputChange={(_, value) => setInputValue(value)}
      options={selectedOptions}
      selectOnFocus={false}
    />
  );
};

interface GetOptionsProps {
  creatable: SelectProps['creatable'];
  inputValue: string;
  options: readonly InternalOptionType[];
}

const getOptions = ({ creatable, inputValue, options }: GetOptionsProps) => {
  if (!creatable) {
    return options;
  }

  if (options.length === 0 && !inputValue) {
    return [{ label: 'No options available', noOptions: true, value: '' }];
  }

  if (inputValue) {
    const matchingOptions = options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        opt.value.toLowerCase().includes(inputValue.toLowerCase())
    );

    if (!matchingOptions.length) {
      return [{ create: true, label: inputValue, value: inputValue }];
    }

    return [
      { create: true, label: inputValue, value: inputValue },
      ...matchingOptions,
    ].sort((a, b) => {
      if (a.create) {
        return -1;
      }
      if (b.create) {
        return 1;
      }
      return a.label.localeCompare(b.label);
    });
  }

  return options;
};
