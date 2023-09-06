import { APIError, NodeBalancer } from '@linode/api-v4';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Autocomplete from '@mui/material/Autocomplete';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { TextField } from 'src/components/TextField';
import {
  CustomPopper,
  SelectedIcon,
} from 'src/features/Linodes/LinodeSelect/LinodeSelect.styles';
import { useInfiniteNodebalancersQuery } from 'src/queries/nodebalancers';
import { mapIdsToDevices } from 'src/utilities/mapIdsToDevices';

interface NodeBalancerSelectProps {
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  label?: string;
  loading?: boolean;
  noMarginTop?: boolean;
  noOptionsMessage?: string;
  options?: NodeBalancer[];
  optionsFilter?: (nodebalancer: NodeBalancer) => boolean;
  placeholder?: string;
  region?: string;
  renderOption?: (nodebalancer: NodeBalancer, selected: boolean) => JSX.Element;
}

export interface NodeBalancerMultiSelectProps extends NodeBalancerSelectProps {
  /* Enable multi-select. */
  multiple: true;
  /* Called when the value changes */
  onSelectionChange: (nodebalancers: NodeBalancer[]) => void;
  /* An array of `id`s of NodeBalancers that should be selected or a function that should return `true` if the Linode should be selected. */
  value: ((nodebalancer: NodeBalancer) => boolean) | null | number[];
}

export interface NodeBalancerSingleSelectProps extends NodeBalancerSelectProps {
  /* Enable single-select. */
  multiple?: false;
  /* Called when the value changes */
  onSelectionChange: (nodebalancer: NodeBalancer | undefined) => void;
  /* The `id` of the selected NodeBalancer or a function that should return `true` if the NodeBalancer should be selected. */
  value: ((nodebalancer: NodeBalancer) => boolean) | null | number;
}

export const NodeBalancerSelect = (
  props: NodeBalancerMultiSelectProps | NodeBalancerSingleSelectProps
) => {
  const {
    disabled,
    errorText,
    helperText,
    label,
    loading,
    multiple,
    noMarginTop,
    noOptionsMessage,
    onSelectionChange,
    options,
    optionsFilter,
    placeholder,
    region,
    renderOption,
    value,
  } = props;

  const [inputValue, setInputValue] = React.useState<string>('');

  const searchFilter = inputValue
    ? {
        '+or': [
          { label: { '+contains': inputValue } },
          { tags: { '+contains': inputValue } },
        ],
      }
    : {};

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteNodebalancersQuery({
    ...searchFilter,
    ...(region ? { region } : {}),
    '+order': 'asc',
    '+order_by': 'label',
  });

  const unfilteredNodebalancers = data?.pages.flatMap((page) => page.data);

  const nodebalancers = optionsFilter
    ? unfilteredNodebalancers?.filter(optionsFilter)
    : unfilteredNodebalancers;

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
      ListboxProps={{
        onScroll: (event: React.SyntheticEvent) => {
          const listboxNode = event.currentTarget;
          if (
            listboxNode.scrollTop + listboxNode.clientHeight >=
              listboxNode.scrollHeight &&
            hasNextPage
          ) {
            fetchNextPage();
          }
        },
      }}
      noOptionsText={
        noOptionsMessage ?? (
          <i>{getDefaultNoOptionsMessage(error, isLoading, nodebalancers)}</i>
        )
      }
      onChange={(_, value) =>
        multiple && Array.isArray(value)
          ? onSelectionChange(value as NodeBalancer[])
          : !multiple &&
            !Array.isArray(value) &&
            onSelectionChange(value as NodeBalancer)
      }
      renderInput={(params) => (
        <TextField
          placeholder={
            placeholder
              ? placeholder
              : multiple
              ? 'Select NodeBalancers'
              : 'Select a NodeBalancer'
          }
          errorText={error?.[0].reason ?? errorText}
          helperText={helperText}
          inputId={params.id}
          label={label ? label : multiple ? 'NodeBalancers' : 'NodeBalancer'}
          loading={isLoading}
          noMarginTop={noMarginTop}
          {...params}
        />
      )}
      renderOption={(props, option, { selected }) => {
        return (
          <li {...props}>
            {renderOption ? (
              renderOption(option as NodeBalancer, selected)
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
      value={
        typeof value === 'function'
          ? multiple && Array.isArray(value)
            ? nodebalancers?.filter(value) ?? null
            : nodebalancers?.find(value) ?? null
          : mapIdsToDevices<NodeBalancer>(value ?? null, nodebalancers)
      }
      ChipProps={{ deleteIcon: <CloseIcon /> }}
      PopperComponent={CustomPopper}
      clearOnBlur={false}
      disableCloseOnSelect={multiple}
      disablePortal={true}
      disabled={disabled}
      inputValue={inputValue}
      // isOptionEqualToValue={(option) => option.id === selectedNodebalancer?.id}
      loading={isLoading || loading}
      multiple={multiple}
      onInputChange={(_, value) => setInputValue(value)}
      options={options || (nodebalancers ?? [])}
      popupIcon={<KeyboardArrowDownIcon />}
    />
  );
};

const getDefaultNoOptionsMessage = (
  error: APIError[] | null,
  loading: boolean,
  filteredNodeBalancers: NodeBalancer[] | undefined
) => {
  if (error) {
    return 'An error occured while fetching your NodeBalancers';
  } else if (loading) {
    return 'Loading your NodeBalancers...';
  } else if (!filteredNodeBalancers?.length) {
    return 'You have no NodeBalancers to choose from';
  } else {
    return 'No options';
  }
};
