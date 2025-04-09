import React from 'react';

import { Autocomplete } from '../Autocomplete';
import { CircleProgress } from '../CircleProgress';
import { InputAdornment } from '../InputAdornment';
import { ListItem } from '../ListItem';
import { TextField } from '../TextField';

import type { EnhancedAutocompleteProps } from '../Autocomplete';
import type { AutocompleteValue, SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

type Option<T = number | string> = {
  label: string;
  value: T;
};

export type SelectOption<
  T = number | string,
  Nullable extends boolean = false,
> = Nullable extends true
  ? AutocompleteValue<Option<T>, false, false, false>
  : Option<T>;

interface InternalOptionType extends SelectOption {
  /**
   * Whether the option is a "create" option.
   *
   * @default false
   */
  create?: boolean;
  /**
   * Whether the option is a "no options" option.
   *
   * @default false
   */
  noOptions?: boolean;
}

export interface SelectProps<T extends { label: string }>
  extends Pick<
    EnhancedAutocompleteProps<T>,
    | 'disabled'
    | 'errorText'
    | 'helperText'
    | 'id'
    | 'isOptionEqualToValue'
    | 'loading'
    | 'noOptionsText'
    | 'onBlur'
    | 'open'
    | 'options'
    | 'placeholder'
    | 'ref'
    | 'sx'
    | 'textFieldProps'
    | 'value'
  > {
  /**
   * Whether the Autocomplete should be focused when it mounts.
   *
   * @default false
   */
  autoFocus?: boolean;
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
   * The props for the ListItem component.
   */
  listItemProps?: (value: T) => {
    dataAttributes?: Record<string, T | boolean | string>;
  };
  /**
   * The callback function that is invoked when the value changes.
   */
  onChange?: (_event: React.SyntheticEvent, _value: T) => void;
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
   * The style overrides for the select.
   */
  sx?: SxProps<Theme>;
}

/**
 * An abstracted Autocomplete component with a limited set of props.
 * Meant to be used when needing:
 * - A simple select
 * - A create-able select
 *
 * For any other use-cases, use the Autocomplete component directly.
 */
export const Select = <T extends SelectOption = SelectOption>(
  props: SelectProps<T>,
) => {
  const {
    autoFocus = false,
    clearable = false,
    creatable = false,
    hideLabel = false,
    label,
    listItemProps,
    loading = false,
    noOptionsText = 'No options available',
    onChange,
    options,
    searchable = false,
    sx,
    textFieldProps,
    ...rest
  } = props;
  const [inputValue, setInputValue] = React.useState('');

  const handleChange = (
    event: React.SyntheticEvent,
    value: SelectOption | null | string,
  ) => {
    if (creatable && typeof value === 'string') {
      onChange?.(event, {
        label: value,
        value,
      } as T);
    } else if (value && typeof value === 'object' && 'label' in value) {
      const { label, value: optionValue } = value;
      onChange?.(event, {
        label,
        value: optionValue,
      } as T);
    } else {
      onChange?.(event, null as unknown as T);
    }
  };

  const _options = React.useMemo(
    () => getOptions({ creatable, inputValue, options }),
    [creatable, inputValue, options],
  );

  return (
    <Autocomplete<SelectOption, false, boolean, boolean>
      {...rest}
      isOptionEqualToValue={(option, value) => {
        if (!option || !value) {
          return false;
        }
        return option.value === value.value;
      }}
      renderInput={(params) => (
        <TextField
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          {...params}
          {...textFieldProps}
          InputProps={{
            ...params.InputProps,
            ...textFieldProps?.InputProps,
            endAdornment: (
              <>
                {loading && (
                  <InputAdornment position="end">
                    <CircleProgress noPadding size="xs" />
                  </InputAdornment>
                )}
                {textFieldProps?.InputProps?.endAdornment}
                {params.InputProps.endAdornment}
              </>
            ),
            sx: { cursor: creatable || searchable ? 'text' : 'pointer' },
          }}
          inputProps={{
            ...params.inputProps,
            ...textFieldProps?.inputProps,
            readOnly: !creatable && !searchable,
            sx: { cursor: creatable || searchable ? 'text' : 'pointer' },
          }}
          errorText={props.errorText}
          helperText={props.helperText}
          hideLabel={hideLabel}
          inputId={params.id}
          label={label}
          placeholder={props.placeholder}
          required={props.required}
          sx={sx}
        />
      )}
      renderOption={(props, option: InternalOptionType) => {
        const { key, ...rest } = props;
        return (
          <ListItem
            {...rest}
            {...(option.create || option.noOptions
              ? undefined
              : listItemProps?.(option as T)?.dataAttributes)}
            sx={
              option.noOptions
                ? {
                    opacity: '1 !important',
                  }
                : null
            }
            key={option.create ? `create-${option.value}` : key}
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
      sx={{
        ...sx,
        ...(!creatable && !searchable
          ? {
              '& .MuiInputBase-input': {
                '&::selection': {
                  background: 'transparent',
                },
              },
            }
          : null),
      }}
      disableClearable={!clearable}
      forcePopupIcon
      freeSolo={creatable}
      getOptionDisabled={(option: SelectOption) => option.value === ''}
      label={label}
      noOptionsText={noOptionsText}
      onChange={handleChange}
      onInputChange={(_, value) => setInputValue(value)}
      options={_options}
      selectOnFocus={false}
    />
  );
};

interface GetOptionsProps {
  /**
   * Whether the select can create a new option.
   */
  creatable: boolean;
  /**
   * The input value.
   */
  inputValue: string;
  /**
   * The options for the Select component.
   */
  options: readonly InternalOptionType[];
}

/**
 * Get the options for the Select component.
 *
 * This allows us to refine the logic the displays ot then options based on the type of select.
 */
const getOptions = ({ creatable, inputValue, options }: GetOptionsProps) => {
  // Early return for as "simple" select
  if (!creatable) {
    return options;
  }

  // If there's no input value and no options, show the "no options" option
  if (options.length === 0 && !inputValue) {
    return [{ label: 'No options available', noOptions: true, value: '' }];
  }

  if (inputValue) {
    const matchingOptions = options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        opt.value.toString().toLowerCase().includes(inputValue.toLowerCase()),
    );

    const exactMatch = matchingOptions.some(
      (opt) =>
        opt.label.toLowerCase() === inputValue.toLowerCase() ||
        opt.value.toString().toLowerCase() === inputValue.toLowerCase(),
    );

    // If there's an exact match, don't show is as a create option
    // This is for when a field has a default value
    if (exactMatch) {
      return options;
    }

    // If there's no matching options, just show the create option
    if (!matchingOptions.length) {
      return [{ create: true, label: inputValue, value: inputValue }];
    }

    // If there's matching options, show the create option and the matching options
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
