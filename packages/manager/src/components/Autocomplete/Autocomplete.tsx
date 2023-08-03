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

export interface OptionsType<T = string, L = string> {
  data?: any;
  label: L;
  value: T;
}

interface AutocompleteProps {
  /** Whether to display the clear icon. Defaults to `true`. */
  clearable?: boolean;
  /** Disable editing the input value. */
  disabled?: boolean;
  /** Hint displayed with error styling. */
  errorText?: string;
  /** Hint displayed in normal styling. */
  helperText?: string;
  /** The ID of the input. */
  id?: string;
  /** Label is required for accessibility */
  label: string;
  /** Adds styling to indicate a loading state. */
  loading?: boolean;
  /** Optionally disable top margin for input label */
  noMarginTop?: boolean;
  /** Message displayed when no options match the user's search. */
  noOptionsMessage?: string;
  /** Called when the input loses focus. */
  onBlur?: (e: React.FocusEvent) => void;
  /* The options to display in the select. */
  options: OptionsType[];
  /** Determine which Linodes should be available as options. */
  optionsFilter?: (option: any) => boolean;
  /* Displayed when the input is blank. */
  placeholder?: string;
  /* Render a custom option. */
  renderOption?: (option: any, selected: boolean) => JSX.Element;
  /* Render a custom option label. */
  renderOptionLabel?: (option: any) => string;
  /* Displays an indication that the input is required. */
  required?: boolean;
  /* Adds custom styles to the component. */
  sx?: SxProps;
}

// TODO: Escape crashes the Autocomplete

export interface AutocompleteMultiSelectProps extends AutocompleteProps {
  // value: any;
  defaultValue?: OptionsType[]; // TODO: This is not working =(
  /* Enable multi-select. */
  multiple: true;
  /* An array of `id`s of Linodes that should be selected or a function that should return `true` if the Linode should be selected. */
  /* Called when the value changes */
  onSelectionChange: (selected: OptionsType[]) => void;
}

export interface AutocompleteSingleSelectProps extends AutocompleteProps {
  // value: any;
  defaultValue?: OptionsType | null;
  /* Enable single-select. */
  multiple?: false;
  /* The `id` of the selected Linode or a function that should return `true` if the Linode should be selected. */
  /* Called when the value changes */
  onSelectionChange: (selected: OptionsType | null) => void;
}

/**
 * A select input allowing selection between account Linodes.
 */
export const Autocomplete = (
  props: AutocompleteMultiSelectProps | AutocompleteSingleSelectProps
) => {
  const {
    clearable = true,
    defaultValue,
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
    // value,
  } = props;

  const [inputValue, setInputValue] = React.useState('');

  const filteredOptions = optionsFilter
    ? options?.filter(optionsFilter)
    : options || [];

  React.useEffect(() => {
    /** We want to clear the input value when the value prop changes to null.
     * This is for use cases where a user changes their region and the Linode
     * they had selected is no longer available.
     */
    if (defaultValue === null) {
      setInputValue('');
    }
  }, [defaultValue]);

  return (
    <MuiAutocomplete
      getOptionLabel={(option: any) =>
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
      onChange={(_, value) =>
        multiple && Array.isArray(value)
          ? onSelectionChange(value)
          : !multiple && !Array.isArray(value) && onSelectionChange(value)
      }
      renderInput={(params) => (
        <TextField
          placeholder={
            placeholder
              ? placeholder
              : multiple
              ? 'Select Linodes'
              : 'Select a Linode'
          }
          errorText={errorText}
          helperText={helperText}
          inputId={params.id}
          label={label}
          loading={loading}
          noMarginTop={noMarginTop}
          {...params}
        />
      )}
      renderOption={(props, option, { selected }) => {
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
      clearOnBlur={false}
      // value={value}
      defaultValue={defaultValue}
      disableClearable={!clearable}
      disableCloseOnSelect={multiple}
      disablePortal={true}
      disabled={disabled}
      id={id}
      inputValue={inputValue}
      loading={loading}
      multiple={multiple}
      onBlur={onBlur}
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

interface DefaultNoOptionsMessageResult {
  message: string;
}

const getDefaultNoOptionsMessage = ({
  errorText,
  filteredOptions,
  loading,
}: DefaultNoOptionsMessageParams): DefaultNoOptionsMessageResult => {
  if (errorText) {
    return { message: 'An error occurred while fetching your options' };
  } else if (loading) {
    return { message: 'Loading...' };
  } else if (!filteredOptions?.length) {
    return { message: 'You have no options to choose from' };
  } else {
    return { message: 'No results' };
  }
};
