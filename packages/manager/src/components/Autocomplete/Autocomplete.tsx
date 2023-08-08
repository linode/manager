import { APIError } from '@linode/api-v4';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MuiAutocomplete, {
  AutocompleteChangeReason,
} from '@mui/material/Autocomplete';
import { SxProps } from '@mui/system';
import React, { useCallback } from 'react';

import { Box } from 'src/components/Box';
import { TextField } from 'src/components/TextField';

import {
  CustomPopper,
  SelectedIcon,
  StyledListItem,
} from './Autocomplete.styles';

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
  /** The maximum number of tags to display when multiple is true. */
  limitTags?: number;
  /** Adds styling to indicate a loading state. */
  loading?: boolean;
  /** Text displayed when loading. */
  loadingText?: string;
  /** Optionally disable top margin for input label. */
  noMarginTop?: boolean;
  /** Message displayed when no options match the user's search. */
  noOptionsMessage?: string;
  /** Called when the input loses focus. */
  onBlur?: (e: React.FocusEvent) => void;
  /** Callback function called when the clear option is toggled. */
  onClearOptions?: () => void;
  /** Callback function called when the select all option is toggled. */
  onSelectAll?: (isSelected: boolean) => void;
  /** Callback function called when the clear option is toggled. */
  onToggleOption?: (selectedOptions: OptionsType[]) => void;
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
  /** The label of the select all option */
  selectAllLabel?: string;
  /** Callback function called when the select all option is toggled. */
  selectedValues?: OptionsType[];
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
  defaultValue?: OptionsType;
  /** Enable single-select mode. */
  multiple?: false;
  /** Callback function called when the value changes in single-select mode. */
  onSelectionChange: (selected: OptionsType) => void;
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
    limitTags = 2,
    loading = false,
    loadingText,
    multiple = false,
    noMarginTop,
    noOptionsMessage,
    onBlur,
    onClearOptions,
    onSelectAll,
    onSelectionChange,
    onToggleOption,
    options,
    optionsFilter,
    placeholder,
    renderOption,
    renderOptionLabel,
    selectAllLabel = 'Select all',
    selectedValues,
    sx,
    ...rest
  } = props;

  const [inputValue, setInputValue] = React.useState('');
  const filteredOptions = optionsFilter
    ? options?.filter(optionsFilter)
    : options || [];
  const selectAllFilteredOptions = [
    { label: selectAllLabel, value: 'all' },
    ...filteredOptions,
  ];
  const allSelected = options.length === selectedValues?.length;

  const handleToggleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll(!allSelected);
    }
  };

  const handleMultiSelectChange = (
    value: OptionsType[],
    reason: AutocompleteChangeReason
  ) => {
    if (reason === 'clear' && onClearOptions) {
      return onClearOptions();
    }
    if (value.some((option) => option.value === 'all')) {
      handleToggleSelectAll();
    } else if (onToggleOption) {
      onToggleOption(value);
    }
  };

  const handleSingleSelectChange = (value: OptionsType) => {
    // onSelectionChange(value);
  };

  // const handleChange = (
  //   value: OptionsType | OptionsType[],
  //   reason: AutocompleteChangeReason,
  //   multiple: boolean
  // ) => {
  //   if (Array.isArray(value) && multiple) {
  //     handleMultiSelectChange(value, reason);
  //   } else if (!Array.isArray(value) && !multiple) {
  //     handleSingleSelectChange(value);
  //   }
  // };

  const handleChange = (
    value: OptionsType | OptionsType[],
    reason: AutocompleteChangeReason,
    multiple: boolean
  ) => {
    if (Array.isArray(value) && multiple) {
      handleMultiSelectChange(value, reason);
    } else if (!Array.isArray(value) && !multiple) {
      handleSingleSelectChange(value);
    }
  };

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

  return (
    <MuiAutocomplete
      {...rest}
      getOptionLabel={(option: OptionsType) =>
        renderOptionLabel ? renderOptionLabel(option) : option.label
      }
      isOptionEqualToValue={(option: OptionsType, value: OptionsType) => {
        return option.value === value.value;
      }}
      noOptionsText={
        noOptionsMessage ?? (
          <i>
            {getDefaultNoOptionsMessage({
              errorText,
              filteredOptions,
            })}
          </i>
        )
      }
      onChange={(_, value: OptionsType, reason) =>
        handleChange(value, reason, multiple)
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
        const selectAllOption = option.value === 'all';

        const ListItem = selectAllOption ? StyledListItem : 'li';

        return (
          <ListItem {...props}>
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
          </ListItem>
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
      limitTags={limitTags}
      loading={loading}
      loadingText={loadingText || 'Loading...'}
      multiple={multiple}
      onBlur={onBlur}
      onInputChange={(_, value) => setInputValue(value)}
      options={multiple ? selectAllFilteredOptions : filteredOptions}
      popupIcon={<KeyboardArrowDownIcon />}
      sx={sx}
      value={selectedValues}
    />
  );
};

interface DefaultNoOptionsMessageParams {
  errorText: APIError[] | null | string | undefined;
  filteredOptions: OptionsType[] | undefined;
}

type DefaultNoOptionsMessageResult = JSX.Element | string;

const getDefaultNoOptionsMessage = ({
  errorText,
  filteredOptions,
}: DefaultNoOptionsMessageParams): DefaultNoOptionsMessageResult => {
  if (errorText) {
    return 'An error occurred while fetching your options';
  } else if (!filteredOptions?.length) {
    return 'You have no options to choose from';
  } else {
    return 'No results';
  }
};
