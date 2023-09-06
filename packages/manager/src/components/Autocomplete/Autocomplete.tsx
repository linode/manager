import { APIError } from '@linode/api-v4';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MuiAutocomplete from '@mui/material/Autocomplete';
import { SxProps } from '@mui/system';
import React, { useCallback } from 'react';

import { Box } from 'src/components/Box';
import { TextField } from 'src/components/TextField';
import { useSelectAllOptions } from 'src/hooks/useSelectAllOptions';

import {
  CustomPopper,
  SelectedIcon,
  StyledListItem,
} from './Autocomplete.styles';

import type {
  AutocompleteChangeReason,
  AutocompleteOwnerState,
  AutocompleteProps,
  AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete';

export interface OptionType<T = any> {
  data?: T;
  label: string;
  value: string;
}

interface DefaultNoOptionsMessage {
  errorText: APIError[] | null | string;
  options: readonly OptionType[];
}

interface AutocompleteOnChange {
  initialOptions: OptionType[];
  reason: AutocompleteChangeReason;
  selectedOptions: OptionType | OptionType[];
}

interface HandleMultiSelectionChange extends AutocompleteOnChange {
  onSelectionChange: (selection: OptionType | OptionType[]) => void;
  selectedOptions: OptionType[];
}

interface HandleChangeParams extends AutocompleteOnChange {
  handleMultiSelectionChange: (params: HandleMultiSelectionChange) => void;
  onSelectionChange: (selection: OptionType | OptionType[]) => void;
}

export interface EnhancedAutocompleteProps<T extends OptionType>
  extends AutocompleteProps<
    T,
    boolean | undefined,
    boolean | undefined,
    boolean | undefined
  > {
  /** Provides a hint with error styling to assist users. */
  errorText?: string;
  /** Provides a hint with normal styling to assist users. */
  helperText?: string;
  /** A required label for the Autocomplete to ensure accessibility. */
  label: string;
  /** Removes the top margin from the input label, if desired. */
  noMarginTop?: boolean;
  /** Callback function triggered when the input field loses focus. */
  onBlur?: (e: React.FocusEvent) => void;
  /** Callback function triggered when the selection of options changes. */
  onSelectionChange: (selected: T[]) => void;
  /** Placeholder text displayed in the input field. */
  placeholder?: string;
  /** Custom rendering function for the label of an option. */
  renderOptionLabel?: (option: T) => string;
  /** Indicates whether the input is required, displaying an appropriate indicator. */
  required?: boolean;
  /** Label for the "select all" option. */
  selectAllLabel?: string;
  /** Custom styles to be applied to the Autocomplete component. */
  sx?: SxProps;
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
export const Autocomplete = (props: EnhancedAutocompleteProps<OptionType>) => {
  const {
    clearOnBlur = false,
    defaultValue,
    disablePortal = true,
    errorText = '',
    helperText,
    label,
    limitTags = 2,
    loading = false,
    loadingText,
    multiple = false,
    noMarginTop,
    noOptionsText,
    onBlur,
    onSelectionChange,
    options,
    placeholder,
    renderOption,
    renderOptionLabel,
    selectAllLabel = '',
    sx,
    value,
    ...rest
  } = props;

  const {
    handleClearOptions,
    handleSelectAll,
    handleToggleOption,
    selectedOptions,
  } = useSelectAllOptions([]);

  const [inputValue, setInputValue] = React.useState('');
  const [selectAllActive, setSelectAllActive] = React.useState(false);
  const selectAllText = selectAllActive ? 'Deselect All' : 'Select All';

  const optionsWithSelectAll = [
    { label: `${selectAllText} ${selectAllLabel}`, value: 'all' },
    ...options,
  ];

  const clearOptions = () => {
    handleClearOptions(); // Clear options requested; call callback if available
    setSelectAllActive(false);
    onSelectionChange([]);
  };

  /**
   * This function leverages type narrowing to differentiate between single-select
   * and multi-select modes and calls the appropriate callback functions accordingly.
   */
  const handleChange = ({
    handleMultiSelectionChange,
    initialOptions,
    onSelectionChange,
    reason,
    selectedOptions,
  }: HandleChangeParams) => {
    if (Array.isArray(selectedOptions)) {
      handleMultiSelectionChange({
        initialOptions,
        onSelectionChange,
        reason,
        selectedOptions,
      }); // Handle changes for multi-select mode
    } else {
      onSelectionChange(selectedOptions); // Handle changes for single-select mode
    }
  };

  const handleMultiSelectionChange = ({
    initialOptions,
    onSelectionChange,
    reason,
    selectedOptions,
  }: HandleMultiSelectionChange) => {
    if (reason === 'clear') {
      clearOptions();
    } else if (selectedOptions.some((option) => option.value === 'all')) {
      handleToggleSelectAll(initialOptions); // Handle 'Select all' option selection
    } else if (handleToggleOption) {
      if (initialOptions.length !== selectedOptions?.length) {
        setSelectAllActive(false);
      }
      handleToggleOption(selectedOptions); // Handle individual options selection
      onSelectionChange(selectedOptions);
    }
  };

  const handleToggleSelectAll = (initialOptions: OptionType[]) => {
    const allSelected = initialOptions.length === selectedOptions?.length;

    if (allSelected) {
      return clearOptions();
    }

    handleSelectAll(!allSelected, initialOptions); // If 'onSelectAll' callback exists, toggle the selection of all options
    setSelectAllActive(!allSelected); // Toggle the 'Select all' option
    onSelectionChange(initialOptions);
  };

  const handleRenderOption = useCallback(
    (
      props: React.HTMLAttributes<HTMLLIElement>,
      option: OptionType,
      state: AutocompleteRenderOptionState,
      ownerState: AutocompleteOwnerState<
        OptionType,
        boolean | undefined,
        boolean | undefined,
        boolean | undefined
      >
    ) => {
      const selectAllOption = option.value === 'all';
      const ListItem = selectAllOption ? StyledListItem : 'li';

      return renderOption ? (
        renderOption(props, option, state, ownerState)
      ) : (
        <ListItem {...props}>
          <>
            <Box
              sx={{
                flexGrow: 1,
              }}
            >
              {option.label}
            </Box>
            <SelectedIcon visible={state.selected} />
          </>
        </ListItem>
      );
    },
    [renderOption]
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
      getOptionLabel={(option: OptionType) =>
        renderOptionLabel ? renderOptionLabel(option) : option.label
      }
      isOptionEqualToValue={(option: OptionType, value: OptionType) => {
        return option.value === value.value;
      }}
      noOptionsText={
        noOptionsText || (
          <i>
            {getDefaultNoOptionsMessage({
              errorText,
              options,
            })}
          </i>
        )
      }
      onChange={(_, selectedOptions: OptionType | OptionType[], reason) => {
        const initialOptions = [...options]; // This is to bypass readonly options
        handleChange({
          handleMultiSelectionChange,
          initialOptions,
          onSelectionChange,
          reason,
          selectedOptions,
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
      disableCloseOnSelect={multiple}
      disablePortal={disablePortal}
      inputValue={inputValue}
      limitTags={limitTags}
      loading={loading}
      loadingText={loadingText || 'Loading...'}
      multiple={multiple}
      onBlur={onBlur}
      onInputChange={(_, value) => setInputValue(value)}
      options={multiple ? optionsWithSelectAll : options}
      popupIcon={<KeyboardArrowDownIcon />}
      renderOption={handleRenderOption}
      sx={sx}
      value={multiple ? value || selectedOptions : value} // Only pass value prop for multi-select mode
    />
  );
};

const enum NoOptionsMessage {
  Error = 'An error occurred while fetching your options',
  NoOptions = 'You have no options to choose from',
  NoResults = 'No results',
}

const getDefaultNoOptionsMessage = ({
  errorText,
  options,
}: DefaultNoOptionsMessage): NoOptionsMessage => {
  if (errorText) {
    return NoOptionsMessage.Error;
  }
  if (!options?.length) {
    return NoOptionsMessage.NoOptions;
  }
  return NoOptionsMessage.NoResults;
};
