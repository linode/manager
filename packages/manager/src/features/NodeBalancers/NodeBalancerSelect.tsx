import { useAllNodeBalancersQuery } from '@linode/queries';
import { Autocomplete, CustomPopper } from '@linode/ui';
import { mapIdsToDevices } from '@linode/utilities';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import * as React from 'react';

import type { APIError, NodeBalancer } from '@linode/api-v4';
import type { SxProps, Theme } from '@mui/material/styles';

interface NodeBalancerSelectProps {
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
  /** Override the default "NodeBalancer" or "NodeBalancers" label */
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
  options?: NodeBalancer[];
  /** Determine which NodeBalancers should be available as options. */
  optionsFilter?: (nodebalancer: NodeBalancer) => boolean;
  /* Displayed when the input is blank. */
  placeholder?: string;
  /* Render a custom option. */
  renderOption?: (nodebalancer: NodeBalancer, selected: boolean) => JSX.Element;
  /* Render a custom option label. */
  renderOptionLabel?: (nodebalancer: NodeBalancer) => string;
  /* Displays an indication that the input is required. */
  required?: boolean;
  /* Adds custom styles to the component. */
  sx?: SxProps<Theme>;
}

export interface NodeBalancerMultiSelectProps extends NodeBalancerSelectProps {
  /* Enable multi-select. */
  multiple: true;
  /* Called when the value changes */
  onSelectionChange: (selected: NodeBalancer[]) => void;
  /* An array of `id`s of NodeBalancers that should be selected or a function that should return `true` if the NodeBalancer should be selected. */
  value: ((nodebalancer: NodeBalancer) => boolean) | null | number[];
}

export interface NodeBalancerSingleSelectProps extends NodeBalancerSelectProps {
  /* Enable single-select. */
  multiple?: false;
  /* Called when the value changes */
  onSelectionChange: (selected: NodeBalancer | null) => void;
  /* The `id` of the selected NodeBalancers or a function that should return `true` if the NodeBalancer should be selected. */
  value: ((nodebalancer: NodeBalancer) => boolean) | null | number;
}

/**
 * A select input allowing selection between account NodeBalancers.
 */
export const NodeBalancerSelect = (
  props: NodeBalancerMultiSelectProps | NodeBalancerSingleSelectProps
) => {
  const {
    clearable = true,
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
    value,
  } = props;

  const [inputValue, setInputValue] = React.useState('');

  const { data, error, isLoading } = useAllNodeBalancersQuery();

  const nodebalancers = optionsFilter ? data?.filter(optionsFilter) : data;

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
      getOptionLabel={(nodebalancer: NodeBalancer) =>
        renderOptionLabel ? renderOptionLabel(nodebalancer) : nodebalancer.label
      }
      noOptionsText={
        noOptionsMessage ?? getDefaultNoOptionsMessage(error, isLoading)
      }
      onChange={(_, value) =>
        multiple && Array.isArray(value)
          ? onSelectionChange(value)
          : !multiple && !Array.isArray(value) && onSelectionChange(value)
      }
      placeholder={
        placeholder
          ? placeholder
          : multiple
            ? 'Select NodeBalancers'
            : 'Select a NodeBalancer'
      }
      renderOption={
        renderOption
          ? (props, option, { selected }) => {
              const { key, ...rest } = props;
              return (
                <li {...rest} data-qa-linode-option key={key}>
                  {renderOption(option, selected)}
                </li>
              );
            }
          : undefined
      }
      value={
        typeof value === 'function'
          ? multiple && Array.isArray(value)
            ? (nodebalancers?.filter(value) ?? null)
            : (nodebalancers?.find(value) ?? null)
          : mapIdsToDevices<NodeBalancer>(value, nodebalancers)
      }
      ChipProps={{ deleteIcon: <CloseIcon /> }}
      PopperComponent={CustomPopper}
      clearOnBlur={false}
      data-testid="add-nodebalancer-autocomplete"
      disableClearable={!clearable}
      disableCloseOnSelect={multiple}
      disablePortal={true}
      disabled={disabled}
      errorText={error?.[0].reason ?? errorText}
      helperText={helperText}
      id={id}
      inputValue={inputValue}
      label={label ? label : multiple ? 'NodeBalancers' : 'NodeBalancer'}
      loading={isLoading || loading}
      multiple={multiple}
      noMarginTop={noMarginTop}
      onBlur={onBlur}
      onInputChange={(_, value) => setInputValue(value)}
      options={options || (nodebalancers ?? [])}
      popupIcon={<KeyboardArrowDownIcon />}
      sx={sx}
    />
  );
};

const getDefaultNoOptionsMessage = (
  error: APIError[] | null,
  loading: boolean
) => {
  if (error) {
    return 'An error occurred while fetching your NodeBalancers';
  } else if (loading) {
    return 'Loading your NodeBalancers...';
  } else {
    return 'No available NodeBalancers';
  }
};
