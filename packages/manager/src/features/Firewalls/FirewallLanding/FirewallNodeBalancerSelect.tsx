import { APIError } from '@linode/api-v4';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Autocomplete } from '@mui/material';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { TextField } from 'src/components/TextField';
import { useInfiniteNodebalancersQuery } from 'src/queries/nodebalancers';

import { SelectedIcon } from '../../../features/Linodes/LinodeSelect/LinodeSelect.styles';

interface FirewallNodeBalancerSelectProps {
  clearable?: boolean;
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  id?: string;
  loading?: boolean;
  multiple: true;
  noMarginTop?: boolean;
  onBlur?: (e: React.FocusEvent) => void;
  onSelectionChange: (selected: NodeBalancer[]) => void;
  optionsFilter?: (nodebalancer: NodeBalancer) => boolean;
  renderOptionLabel?: (nodebalancer: NodeBalancer) => string;
  required?: boolean;
  value: ((nodebalancer: NodeBalancer) => boolean) | number[];
}

export const FirewallNodeBalancerSelect = (
  props: FirewallNodeBalancerSelectProps
) => {
  const {
    clearable = true,
    disabled,
    errorText,
    helperText,
    id,
    loading,
    multiple,
    noMarginTop,
    onBlur,
    onSelectionChange,
    optionsFilter,
    renderOptionLabel,
    value,
  } = props;

  const [inputValue, setInputValue] = React.useState('');

  React.useEffect(() => {
    if (value === null) {
      setInputValue('');
    }
  }, [value]);

  const searchFilter = inputValue
    ? {
        '+or': [
          { label: { '+contains': inputValue } },
          { tags: { '+contains': inputValue } },
        ],
      }
    : {};

  const { data, error, isLoading } = useInfiniteNodebalancersQuery({
    ...searchFilter,
    '+order': 'asc',
    '+order_by': 'label',
  });

  const nodebalancers = optionsFilter
    ? data?.pages.flatMap((page) => page.data)?.filter(optionsFilter)
    : data?.pages.flatMap((page) => page.data);

  return (
    <Autocomplete
      getOptionLabel={(nodebalancer: NodeBalancer) =>
        renderOptionLabel ? renderOptionLabel(nodebalancer) : nodebalancer.label
      }
      noOptionsText={
        <i>{getDefaultNoOptionsMessage(error, isLoading, nodebalancers)}</i>
      }
      onChange={(_, value) =>
        multiple && Array.isArray(value)
          ? onSelectionChange(value)
          : !multiple && !Array.isArray(value) && onSelectionChange(value)
      }
      renderInput={(params) => (
        <TextField
          placeholder={
            multiple ? 'Select NodeBalancers' : 'Select a NodeBalancer'
          }
          errorText={error?.[0].reason ?? errorText}
          helperText={helperText}
          inputId={params.id}
          label={multiple ? 'NodeBalancers' : 'NodeBalancer'}
          loading={isLoading}
          noMarginTop={noMarginTop}
          {...params}
        />
      )}
      renderOption={(props, option, { selected }) => {
        return (
          <li {...props}>
            <Box
              sx={{
                flexGrow: 1,
              }}
            >
              {option.label}
            </Box>
            <SelectedIcon visible={selected} />
          </li>
        );
      }}
      value={
        typeof value === 'function'
          ? nodebalancers?.filter((nodebalancer) => value(nodebalancer)) ?? []
          : Array.isArray(value)
          ? nodebalancers?.filter((nodebalancer) =>
              value.includes(nodebalancer.id)
            ) ?? []
          : []
      }
      ChipProps={{ deleteIcon: <CloseIcon /> }}
      clearOnBlur={false}
      disableClearable={!clearable}
      disableCloseOnSelect={multiple}
      disablePortal={true}
      disabled={disabled}
      id={id}
      inputValue={inputValue}
      loading={isLoading || loading}
      multiple={multiple}
      onBlur={onBlur}
      onInputChange={(_, value) => setInputValue(value)}
      options={nodebalancers ?? []}
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
    return 'An error occurred while fetching your NodeBalancers';
  } else if (loading) {
    return 'Loading your NodeBalancers...';
  } else if (!filteredNodeBalancers?.length) {
    return 'You have no NodeBalancers to choose from';
  } else {
    return 'No options';
  }
};
