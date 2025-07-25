import { useAllLinodesQuery } from '@linode/queries';
import { Autocomplete, CloseIcon, CustomPopper } from '@linode/ui';
import { mapIdsToDevices } from '@linode/utilities';
import React from 'react';

import { LinodeOption } from './LinodeOption';

import type { APIError, Filter, Linode } from '@linode/api-v4';
import type { SxProps, Theme } from '@linode/ui';

interface LinodeSelectProps {
  /** Determine whether isOptionEqualToValue prop should be defined for Autocomplete
   * component (to avoid "The value provided to Autocomplete is invalid [...]" console
   * errors). See https://github.com/linode/manager/pull/10089 for context & discussion.
   */
  checkIsOptionEqualToValue?: boolean;
  /** Whether to display the clear icon. Defaults to `true`. */
  clearable?: boolean;
  /** Disable editing the input value. */
  disabled?: boolean;
  /** Map of Linode IDs to be disabled with a reason. */
  disabledLinodes?: Record<number, string>;
  /** Hint displayed with error styling. */
  errorText?: string;
  /** Filter sent to the API when retrieving account Linodes. */
  filter?: Filter;
  /** Determines if the Linode option should be disabled. */
  getOptionDisabled?: (linode: Linode) => boolean;
  /** Hint displayed in normal styling. */
  helperText?: string;
  /** The ID of the input. */
  id?: string;
  /** Override the default "Linode" or "Linodes" label */
  label?: string;
  /** Adds styling to indicate a loading state. */
  loading?: boolean;
  /** Optionally disable top margin for input label */
  noMarginTop?: boolean;
  /** Message displayed when no options match the user's search. */
  noOptionsMessage?: string;
  /** Called when the input loses focus. */
  onBlur?: (e: React.FocusEvent) => void;
  /* The options to display in the select. */
  options?: Linode[];
  /** Determine which Linodes should be available as options. */
  optionsFilter?: (linode: Linode) => boolean;
  /* Displayed when the input is blank. */
  placeholder?: string;
  /* Displays an indication that the input is required. */
  required?: boolean;
  /* Adds custom styles to the component. */
  sx?: SxProps<Theme>;
}

export interface LinodeMultiSelectProps extends LinodeSelectProps {
  /* Enable multi-select. */
  multiple: true;
  /* Called when the value changes */
  onSelectionChange: (selected: Linode[]) => void;
  /* An array of `id`s of Linodes that should be selected or a function that should return `true` if the Linode should be selected. */
  value: ((linode: Linode) => boolean) | null | number[];
}

export interface LinodeSingleSelectProps extends LinodeSelectProps {
  /* Enable single-select. */
  multiple?: false;
  /* Called when the value changes */
  onSelectionChange: (selected: Linode | null) => void;
  /* The `id` of the selected Linode or a function that should return `true` if the Linode should be selected. */
  value: ((linode: Linode) => boolean) | null | number;
}

/**
 * A select input allowing selection between account Linodes.
 */
export const LinodeSelect = (
  props: LinodeMultiSelectProps | LinodeSingleSelectProps,
) => {
  const {
    checkIsOptionEqualToValue,
    clearable = true,
    disabled,
    disabledLinodes,
    errorText,
    filter,
    getOptionDisabled,
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
    sx,
    value,
  } = props;

  const { data, error, isFetching } = useAllLinodesQuery({}, filter, !options);

  const [inputValue, setInputValue] = React.useState('');

  let linodes = options || data;
  linodes = optionsFilter ? linodes?.filter(optionsFilter) : linodes;

  React.useEffect(() => {
    /** We want to clear the input value when the value prop changes to null.
     * This is for use cases where a user changes their region and the Linode
     * they had selected is no longer available.
     */
    if (value === null) {
      setInputValue('');
    }
  }, [value]);

  return (
    <Autocomplete
      clearOnBlur={false}
      data-testid="add-linode-autocomplete"
      disableClearable={!clearable}
      disableCloseOnSelect={multiple}
      disabled={disabled}
      disablePortal={true}
      errorText={error?.[0].reason ?? errorText}
      getOptionDisabled={(linode) =>
        !!disabledLinodes?.[linode.id] || getOptionDisabled?.(linode) || false
      }
      helperText={helperText}
      id={id}
      inputValue={inputValue}
      isOptionEqualToValue={
        checkIsOptionEqualToValue
          ? (option, value) => option.id === value.id
          : undefined
      }
      label={label ? label : multiple ? 'Linodes' : 'Linode'}
      loading={isFetching || loading}
      multiple={multiple}
      noMarginTop={noMarginTop}
      noOptionsText={
        noOptionsMessage ?? getDefaultNoOptionsMessage(error, isFetching)
      }
      onBlur={onBlur}
      onChange={(_, value) =>
        multiple && Array.isArray(value)
          ? onSelectionChange(value)
          : !multiple && !Array.isArray(value) && onSelectionChange(value)
      }
      onInputChange={(_, value) => setInputValue(value)}
      options={linodes ?? []}
      placeholder={
        placeholder
          ? placeholder
          : multiple
            ? 'Select Linodes'
            : 'Select a Linode'
      }
      PopperComponent={CustomPopper}
      renderOption={(linode, props, { selected }) => (
        <LinodeOption
          disabledReason={disabledLinodes?.[linode.id]}
          key={linode.id}
          linode={linode}
          props={props}
          selected={selected}
        />
      )}
      slotProps={{ chip: { deleteIcon: <CloseIcon /> } }}
      sx={sx}
      value={
        typeof value === 'function'
          ? multiple && Array.isArray(value)
            ? (linodes?.filter(value) ?? null)
            : (linodes?.find(value) ?? null)
          : mapIdsToDevices<Linode>(value, linodes)
      }
    />
  );
};

const getDefaultNoOptionsMessage = (
  error: APIError[] | null,
  loading: boolean,
) => {
  if (error) {
    return 'An error occurred while fetching your Linodes';
  } else if (loading) {
    return 'Loading your Linodes...';
  } else {
    return 'No available Linodes';
  }
};
