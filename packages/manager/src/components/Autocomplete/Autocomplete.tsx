import { APIError } from '@linode/api-v4';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MuiAutocomplete, {
  AutocompleteChangeReason,
  AutocompleteProps,
  AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete';
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

export interface OptionType<T = any> {
  data?: T;
  label: string;
  value: string;
}

interface DefaultNoOptionsMessageParams {
  errorText: APIError[] | null | string | undefined;
  options: OptionType[];
}

interface AutocompleteOnChange {
  reason: AutocompleteChangeReason;
  value: OptionType | OptionType[];
}

interface HandleChangeParams extends AutocompleteOnChange {
  handleMultiSelectionChange: (
    selections: OptionType[],
    reason: AutocompleteChangeReason
  ) => void;
  onSelectionChange: (selection: OptionType | OptionType[]) => void;
}

type SingleSelectProps = EnhancedAutocompleteProps<OptionType>;
type MultiSelectProps = EnhancedAutocompleteProps<OptionType[]>;

export type CombinedAutocompleteProps = MultiSelectProps | SingleSelectProps;

export interface EnhancedAutocompleteProps<T extends OptionType | OptionType[]>
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
  onSelectionChange: (selected: T) => void;
  /** Placeholder text displayed in the input field. */
  placeholder?: string;
  /** Custom rendering function for the label of an option. */
  renderOptionLabel?: (option: OptionType) => string;
  /** Indicates whether the input is required, displaying an appropriate indicator. */
  required?: boolean;
  /**
   * Label for the "select all" option.
   * @default 'Select all'
   */
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
export const Autocomplete = (props: CombinedAutocompleteProps) => {
  const {
    clearOnBlur = false,
    defaultValue,
    disablePortal = true,
    errorText,
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
    selectAllLabel = 'Select all',
    sx,
    ...rest
  } = props;

  const {
    handleClearOptions,
    handleSelectAll,
    handleToggleOption,
    selectedOptions,
  } = useSelectAllOptions([]);

  const [inputValue, setInputValue] = React.useState('');

  // const flattenedOptions = flattenOptions(options);

  const optionsWithSelectAll = [
    { label: selectAllLabel, value: 'all' },
    ...options,
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
    value: OptionType[],
    reason: AutocompleteChangeReason
  ) => {
    if (reason === 'clear' && handleClearOptions) {
      handleClearOptions(); // Clear options requested; call callback if available
    } else if (value.some((option) => option.value === 'all')) {
      handleToggleSelectAll(value); // Handle 'Select all' option selection
    } else if (handleToggleOption) {
      handleToggleOption(value); // Handle individual options selection
    }
  };

  const handleToggleSelectAll = (options: OptionType[]) => {
    const allSelected = options.length === selectedOptions?.length;

    if (handleSelectAll) {
      handleSelectAll(!allSelected, options); // If 'onSelectAll' callback exists, toggle the selection of all options
    }
  };

  const handleRenderOption = useCallback(
    (
      props: React.HTMLAttributes<HTMLLIElement>,
      option: OptionType,
      { selected }: AutocompleteRenderOptionState
    ) => {
      const selectAllOption = option.value === 'all';

      const ListItem = selectAllOption ? StyledListItem : 'li';

      return (
        <ListItem {...props}>
          {renderOption ? (
            renderOption(props, option, selected)
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
      onChange={(_, value: OptionType | OptionType[], reason) => {
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
      value={multiple ? selectedOptions : undefined} // Only pass value prop for multi-select mode
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
}: DefaultNoOptionsMessageParams): NoOptionsMessage => {
  if (errorText) {
    return NoOptionsMessage.Error;
  } else if (!options?.length) {
    return NoOptionsMessage.NoOptions;
  } else {
    return NoOptionsMessage.NoResults;
  }
};

function flattenOptions<T>(
  options: readonly OptionType<T>[] | readonly OptionType<T>[][]
): readonly OptionType<T>[] {
  if (options.length && Array.isArray(options[0])) {
    // It's a nested array, so flatten it
    return (options as readonly OptionType<T>[][]).reduce(
      (acc, curr) => [...acc, ...curr],
      []
    );
  }

  return options as readonly OptionType<T>[];
}
