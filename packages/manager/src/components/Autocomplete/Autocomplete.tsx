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

interface AutocompleteOnChange {
  reason: AutocompleteChangeReason;
  value: OptionsType | OptionsType[];
}

interface HandleChangeParams extends AutocompleteOnChange {
  handleMultiSelectionChange: (
    selections: OptionsType[],
    reason: AutocompleteChangeReason
  ) => void;
  onSelectionChange: (selection: OptionsType | OptionsType[]) => void;
}

export interface AutocompleteProps<T extends OptionsType | OptionsType[]> {
  /**
   * Determines whether the input field is cleared when it loses focus.
   * @default false
   */
  clearOnBlur?: boolean;
  /**
   * The initial value for the Autocomplete.
   */
  defaultValue?: T;
  /**
   * Disables the display of the clear icon in the input field.
   * @default false
   */
  disableClearable?: boolean;
  /**
   * Disables the rendering of the Autocomplete options within a portal.
   * @default true
   */
  disablePortal?: boolean;
  /** Disables user interaction with the input field. */
  disabled?: boolean;
  /** Provides a hint with error styling to assist users. */
  errorText?: string;
  /** Provides a hint with normal styling to assist users. */
  helperText?: string;
  /** The unique ID associated with the input field. */
  id?: string;
  /** A required label for the Autocomplete to ensure accessibility. */
  label: string;
  /**
   * Sets the maximum number of visible tags when the 'multiple' option is enabled.
   * @default 2
   */
  limitTags?: number;
  /**
   * Displays styling indicating a loading state.
   * @default false
   * */
  loading?: boolean;
  /** Custom text displayed during a loading state. */
  loadingText?: string;
  /**
   * Enables the selection of multiple options.
   * @default false
   * */
  multiple?: boolean;
  /** Removes the top margin from the input label, if desired. */
  noMarginTop?: boolean;
  /** Message to display when no options match the user's search. */
  noOptionsMessage?: string;
  /** Callback function triggered when the input field loses focus. */
  onBlur?: (e: React.FocusEvent) => void;
  /** Callback function to clear all selected options. */
  onClearOptions?: () => void;
  /** Callback function triggered when the select all option is toggled. */
  onSelectAll?: (isSelected: boolean) => void;
  /** Callback function triggered when the selection of options changes. */
  onSelectionChange: (selected: T) => void;
  /** Callback function triggered when specific option selections are toggled. */
  onToggleOption?: (selectedOptions: OptionsType[]) => void;
  /** An array of available options for selection in the Autocomplete. */
  options: OptionsType[];
  /** Custom filter function to control which options are available for selection. */
  optionsFilter?: (option: OptionsType) => boolean;
  /** Placeholder text displayed in the input field. */
  placeholder?: string;
  /** Custom rendering function for individual option items. */
  renderOption?: (option: OptionsType, selected: boolean) => JSX.Element;
  /** Custom rendering function for the label of an option. */
  renderOptionLabel?: (option: OptionsType) => string;
  /** Indicates whether the input is required, displaying an appropriate indicator. */
  required?: boolean;
  /**
   * Label for the "select all" option.
   * @default 'Select all'
   */
  selectAllLabel?: string;
  /** Pre-selected values for the Autocomplete. */
  selectedValues?: OptionsType[];
  /** Custom styles to be applied to the Autocomplete component. */
  sx?: SxProps;
}

type SingleSelectProps = AutocompleteProps<OptionsType>;
type MultiSelectProps = AutocompleteProps<OptionsType[]>;

export type AutocompleteAllProps = MultiSelectProps | SingleSelectProps;

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
export const Autocomplete = (props: AutocompleteAllProps) => {
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

  /**
   * This function leverages type narrowing to differentiate between single-select
   * and multi-select modes and calls the appropriate callback functions accordingly.
   */
  const handleChange = ({
    handleMultiSelectionChange,
    onSelectionChange,
    reason,
    value,
  }: HandleChangeParams) => {
    if (Array.isArray(value)) {
      handleMultiSelectionChange(value, reason); // Handle changes for multi-select mode
    } else {
      onSelectionChange(value); // Handle changes for single-select mode
    }
  };

  const handleMultiSelectionChange = (
    value: OptionsType[],
    reason: AutocompleteChangeReason
  ) => {
    if (reason === 'clear' && onClearOptions) {
      onClearOptions(); // Clear options requested; call callback if available
    } else if (value.some((option) => option.value === 'all')) {
      handleToggleSelectAll(); // Handle 'Select all' option selection
    } else if (onToggleOption) {
      onToggleOption(value); // Handle individual options selection
    }
  };

  const handleToggleSelectAll = () => {
    const allSelected = options.length === selectedValues?.length;

    if (onSelectAll) {
      onSelectAll(!allSelected); // If 'onSelectAll' callback exists, toggle the selection of all options
    }
  };

  const handleRenderOption = useCallback(
    (props, option: OptionsType, { selected }) => {
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
    },
    [renderOption]
  );

  const renderNoOptions = (
    <i>
      {getDefaultNoOptionsMessage({
        errorText,
        filteredOptions,
      })}
    </i>
  );

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
      onChange={(_, value: OptionsType | OptionsType[], reason) => {
        handleChange({
          handleMultiSelectionChange,
          onSelectionChange,
          reason,
          value,
        });
      }}
      renderInput={(params) => (
        <TextField
          errorText={errorText}
          helperText={helperText}
          inputId={params.id}
          label={label}
          loading={loading}
          noMarginTop={noMarginTop}
          placeholder={placeholder || 'Select an option'}
          {...params}
        />
      )}
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
      noOptionsText={noOptionsMessage || renderNoOptions}
      onBlur={onBlur}
      onInputChange={(_, value) => setInputValue(value)}
      options={multiple ? selectAllFilteredOptions : filteredOptions}
      popupIcon={<KeyboardArrowDownIcon />}
      renderOption={handleRenderOption}
      sx={sx}
      value={selectedValues}
    />
  );
};

interface DefaultNoOptionsMessageParams {
  errorText: APIError[] | null | string | undefined;
  filteredOptions: OptionsType[] | undefined;
}

const enum NoOptionsMessage {
  Error = 'An error occurred while fetching your options',
  NoOptions = 'You have no options to choose from',
  NoResults = 'No results',
}

const getDefaultNoOptionsMessage = ({
  errorText,
  filteredOptions,
}: DefaultNoOptionsMessageParams): NoOptionsMessage => {
  if (errorText) {
    return NoOptionsMessage.Error;
  } else if (!filteredOptions?.length) {
    return NoOptionsMessage.NoOptions;
  } else {
    return NoOptionsMessage.NoResults;
  }
};
