import { APIError } from '@linode/api-v4';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MuiAutocomplete from '@mui/material/Autocomplete';
import { SxProps } from '@mui/system';
import React from 'react';

import { Box } from 'src/components/Box';
import { TextField } from 'src/components/TextField';
import {
  CustomPopper,
  SelectedIcon,
} from 'src/features/Linodes/LinodeSelect/LinodeSelect.styles';

export interface OptionsType {
  data?: any;
  label: string;
  value: string;
}

export interface AutocompleteProps {
  /**
   * Whether to clear the autocomplete input on blur.
   * @default false
   * */
  clearOnBlur?: boolean;
  /**
   * Whether to disable the clear icon.
   * @default false
   * */
  disableClearable?: boolean;
  /**
   * Disable the portal behavior.
   * @default true
   * */
  disablePortal?: boolean;
  /** Disable editing the input value. */
  disabled?: boolean;
  /** Hint displayed with error styling. */
  errorText?: string;
  /** Hint displayed in normal styling. */
  helperText?: string;
  /** The ID of the input. */
  id?: string;
  /** Label for the Autocomplete, required for accessibility. */
  label: string;
  /** Adds styling to indicate a loading state. */
  loading?: boolean;
  /** Optionally disable top margin for input label. */
  noMarginTop?: boolean;
  /** Message displayed when no options match the user's search. */
  noOptionsMessage?: string;
  /** Called when the input loses focus. */
  onBlur?: (e: React.FocusEvent) => void;
  /** The options to display in the select. */
  options: OptionsType[];
  /** Function to filter which options should be available. */
  optionsFilter?: (option: OptionsType) => boolean;
  /** Text displayed when the input is blank. */
  placeholder?: string;
  /** Function to render a custom option. */
  renderOption?: (option: OptionsType, selected: boolean) => JSX.Element;
  /** Function to render a custom option label. */
  renderOptionLabel?: (option: OptionsType) => string;
  /** Displays an indication that the input is required. */
  required?: boolean;
  /** Custom styles to apply to the component. */
  sx?: SxProps;
}

/**
 * Props for the Autocomplete component in multi-select mode.
 */
export interface AutocompleteMultiSelectProps extends AutocompleteProps {
  /** Default value for the Autocomplete. */
  defaultValue?: OptionsType[];
  /** Enable multi-select mode. */
  multiple: true;
  /** Callback function called when the value changes in multi-select mode. */
  onSelectionChange: (selected: OptionsType[]) => void;
}

/**
 * Props for the Autocomplete component in single-select mode.
 */
export interface AutocompleteSingleSelectProps extends AutocompleteProps {
  /** Default value for the Autocomplete. */
  defaultValue?: OptionsType | null;
  /** Enable single-select mode. */
  multiple?: false;
  /** Callback function called when the value changes in single-select mode. */
  onSelectionChange: (selected: OptionsType | null) => void;
}

/**
 * An Autocomplete component that provides a user-friendly select input
 * allowing selection between options.
 *
 * @example
 * <Autocomplete
 *  label="Select a Fruit"
 *  onSelectionChange={(selected) => console.log(selected)}
 *  options={[
 *    {
 *      label: 'Apple',
 *      value: 'apple',
 *    }
 *  ]}
 * />
 */
export const Autocomplete = (
  props: AutocompleteMultiSelectProps | AutocompleteSingleSelectProps
) => {
  const {
    clearOnBlur = false,
    defaultValue,
    disableClearable,
    disablePortal = true,
    disabled,
    errorText,
    helperText,
    id,
    label,
    loading,
    multiple,
    noMarginTop,
    noOptionsMessage,
    onBlur,
    onSelectionChange,
    options,
    optionsFilter,
    placeholder,
    renderOption,
    renderOptionLabel,
    sx,
  } = props;

  const [inputValue, setInputValue] = React.useState('');

  const filteredOptions = optionsFilter
    ? options?.filter(optionsFilter)
    : options || [];

  React.useEffect(() => {
    /**
     * We want to clear the input value when the value prop changes to null.
     * This is for use cases where a user changes their region and the Linode
     * they had selected is no longer available.
     */
    if (defaultValue === null) {
      setInputValue('');
    }
  }, [defaultValue]);

  const handleChange = (value: OptionsType | OptionsType[]) => {
    if (Array.isArray(value)) {
      // It's an array, so it's the multiple selection case
      if (!multiple) {
        return;
      }
      onSelectionChange(value);
    } else {
      // It's not an array, so it's the single selection case
      if (multiple) {
        return;
      }
      onSelectionChange(value);
    }
  };

  return (
    <MuiAutocomplete
      getOptionLabel={(option: OptionsType) =>
        renderOptionLabel ? renderOptionLabel(option) : option.label
      }
      noOptionsText={
        noOptionsMessage ?? (
          <i>
            {getDefaultNoOptionsMessage({
              errorText,
              filteredOptions,
              loading,
            })}
          </i>
        )
      }
      renderInput={(params) => (
        <TextField
          errorText={errorText}
          helperText={helperText}
          inputId={params.id}
          label={label}
          loading={loading}
          noMarginTop={noMarginTop}
          placeholder={placeholder ?? 'Select an option'}
          {...params}
        />
      )}
      renderOption={(props, option: OptionsType, { selected }) => {
        return (
          <li {...props}>
            {renderOption ? (
              renderOption(option, selected)
            ) : (
              <>
                <Box
                  sx={{
                    flexGrow: 1,
                  }}
                >
                  {option.label}
                </Box>
                <SelectedIcon visible={selected} />
              </>
            )}
          </li>
        );
      }}
      ChipProps={{ deleteIcon: <CloseIcon /> }}
      PopperComponent={CustomPopper}
      clearOnBlur={clearOnBlur}
      defaultValue={defaultValue}
      disableClearable={disableClearable}
      disableCloseOnSelect={multiple}
      disablePortal={disablePortal}
      disabled={disabled}
      id={id}
      inputValue={inputValue}
      loading={loading}
      multiple={multiple}
      onBlur={onBlur}
      onChange={(_, value: OptionsType) => handleChange(value)}
      onInputChange={(_, value) => setInputValue(value)}
      options={filteredOptions}
      popupIcon={<KeyboardArrowDownIcon />}
      sx={sx}
    />
  );
};

interface DefaultNoOptionsMessageParams {
  errorText: APIError[] | null | string | undefined;
  filteredOptions: OptionsType[] | undefined;
  loading: boolean | undefined;
}

type DefaultNoOptionsMessageResult = JSX.Element | string;

const getDefaultNoOptionsMessage = ({
  errorText,
  filteredOptions,
  loading,
}: DefaultNoOptionsMessageParams): DefaultNoOptionsMessageResult => {
  if (errorText) {
    return 'An error occurred while fetching your options';
  } else if (loading) {
    return 'Loading...';
  } else if (!filteredOptions?.length) {
    return 'You have no options to choose from';
  } else {
    return 'No results';
  }
};
