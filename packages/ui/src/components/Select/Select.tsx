import React from 'react';

import { Autocomplete } from '../Autocomplete';
import { ListItem } from '../ListItem';
import { TextField } from '../TextField';

import type { EnhancedAutocompleteProps } from '../Autocomplete';

type OptionType = {
  create?: boolean;
  label: string;
  noOptions?: boolean;
  value: string;
};

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
    options,
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
        value,
      });
    } else {
      onChange?.(event, value as OptionType | null);
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
      renderOption={(props, option: OptionType) => {
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
      getOptionDisabled={(option: OptionType) => option.value === ''}
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
  options: readonly OptionType[];
}

const getOptions = ({ creatable, inputValue, options }: GetOptionsProps) => {
  if (!creatable) {
    return options;
  }

  if (options.length === 0 && !inputValue) {
    return [{ label: 'No options available', noOptions: true, value: '' }];
  }

  if (inputValue && !options.some((opt) => opt.value === inputValue)) {
    return [
      { create: true, label: inputValue, value: inputValue },
      ...options,
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
