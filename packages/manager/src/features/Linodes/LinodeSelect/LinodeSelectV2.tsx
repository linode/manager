/**
 * The plan is to eventually replace the existing `LinodeSelect` and
 * `LinodeMultiSelect` components with this one. Once that happens,
 * remove 'V2' from this component's name.
 */

import { APIError, Filter, Linode } from '@linode/api-v4';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Autocomplete, Box } from '@mui/material';
import React from 'react';
import { TextField } from 'src/components/TextField';
import { useInfiniteLinodesQuery } from 'src/queries/linodes/linodes';
import { mapIdsToLinodes } from 'src/utilities/mapIdsToLinodes';
import { CustomPopper, RemoveIcon, SelectedIcon } from './LinodeSelect.styles';
import { SxProps } from '@mui/system';
import { privateIPRegex } from 'src/utilities/ipUtils';

interface LinodeSelectProps {
  /** Whether to display the clear icon. Defaults to `true`. */
  clearable?: boolean;
  /** Disable editing the input value. */
  disabled?: boolean;
  /** Hint displayed with error styling. */
  errorText?: string;
  /** The ID of the input. */
  id?: string;
  /** Filter sent to the API when retrieving account Linodes. */
  filter?: Filter;
  /** Hint displayed in normal styling. */
  helperText?: string;
  /** Overrides the default label. */
  showIPAddressLabel?: boolean;
  /** Adds styling to indicate a loading state. */
  loading?: boolean;
  /** Optionally disable top margin for input label */
  noMarginTop?: boolean;
  /** Message displayed when no options match the user's search. */
  noOptionsMessage?: string;
  /** Called when the input loses focus. */
  onBlur?: (e: React.FocusEvent) => void;
  /** Determine which Linodes should be available as options. */
  optionsFilter?: (linode: Linode) => boolean;
  /* Displayed when the input is blank. */
  placeholder?: string;
  /* The region to filter Linodes by. */
  region?: string;
  /* Displays an indication that the input is required. */
  required?: boolean;
  /* Adds custom styles to the component. */
  sx?: SxProps;
}

export interface LinodeMultiSelectProps extends LinodeSelectProps {
  /* Called when the value changes */
  onSelectionChange: (selected: Linode[]) => void;
  /* Enable multi-select. */
  multiple: true;
  /* Current value of the input. */
  value: number[];
}

export interface LinodeSingleSelectProps extends LinodeSelectProps {
  /* Called when the value changes */
  onSelectionChange: (selected: Linode | null) => void;
  /* Enable single-select. */
  multiple?: false;
  /* Current value of the input. */
  value: number | null;
}

/**
 * A select input allowing selection between account Linodes.
 */
export const LinodeSelectV2 = (
  props: LinodeSingleSelectProps | LinodeMultiSelectProps
) => {
  const {
    clearable = true,
    disabled,
    errorText,
    filter,
    helperText,
    id,
    loading,
    multiple,
    noMarginTop,
    noOptionsMessage,
    onBlur,
    onSelectionChange,
    optionsFilter,
    placeholder,
    region,
    showIPAddressLabel,
    sx,
    value,
  } = props;

  const {
    data: linodesData,
    isLoading: linodesDataLoading,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteLinodesQuery(filter);

  const [inputValue, setInputValue] = React.useState('');

  const linodes = linodesData?.pages.flatMap((page) => page.data);

  const filteredLinodes = Boolean(region)
    ? linodes?.filter((thisLinode) => thisLinode.region === region)
    : linodes;

  const filteredLinodesByOptions = optionsFilter
    ? filteredLinodes?.filter(optionsFilter)
    : linodes;

  const handleInputChange = (_: React.SyntheticEvent, value: string) => {
    // Return the private IP address as the value for backend nodes in the NodeBalancer config
    if (showIPAddressLabel) {
      const privateIP = filteredLinodesByOptions
        ?.find((linode) => linode.label === value)
        ?.ipv4.find((eachIP) => eachIP.match(privateIPRegex));

      // TODO: This is causing issues when trying to select a different Linode: http://localhost:3000/nodebalancers/create
      return setInputValue(privateIP ?? '');
    }

    return setInputValue(value);
  };

  return (
    <Autocomplete
      id={id}
      value={mapIdsToLinodes(value, linodes)}
      options={filteredLinodesByOptions ?? []}
      getOptionLabel={(linode) => linode.label}
      clearOnBlur={false}
      ChipProps={{ deleteIcon: <CloseIcon /> }}
      multiple={multiple}
      loading={linodesDataLoading || loading}
      disabled={disabled}
      onChange={(_, value) =>
        multiple && Array.isArray(value)
          ? onSelectionChange(value)
          : !multiple && !Array.isArray(value) && onSelectionChange(value)
      }
      onBlur={onBlur}
      noOptionsText={
        <i>
          {noOptionsMessage ??
            getDefaultNoOptionsMessage(
              error,
              linodesDataLoading,
              filteredLinodesByOptions
            )}
        </i>
      }
      renderInput={(params) => (
        <TextField
          label={multiple ? 'Linodes' : 'Linode'}
          placeholder={
            placeholder || (multiple ? 'Select Linodes' : 'Select a Linode')
          }
          loading={linodesDataLoading}
          errorText={error?.[0].reason ?? errorText}
          helperText={helperText}
          noMarginTop={noMarginTop}
          {...params}
        />
      )}
      inputValue={inputValue}
      onInputChange={handleInputChange}
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
      disableCloseOnSelect={multiple}
      renderOption={(props, option, { selected }) => {
        return (
          <li {...props}>
            <Box
              sx={{
                flexGrow: 1,
              }}
            >
              {showIPAddressLabel ? (
                <div>
                  <strong>
                    {option.ipv4.find((eachIP) => eachIP.match(privateIPRegex))}
                  </strong>
                  <div>{option.label}</div>
                </div>
              ) : (
                option.label
              )}
            </Box>
            <SelectedIcon visible={selected} />
            {multiple && <RemoveIcon visible={selected} />}
          </li>
        );
      }}
      PopperComponent={CustomPopper}
      popupIcon={<KeyboardArrowDownIcon />}
      disableClearable={!clearable}
      sx={sx}
    />
  );
};

const getDefaultNoOptionsMessage = (
  error: APIError[] | null,
  loading: boolean,
  filteredLinodes: Linode[] | undefined
) => {
  if (error) {
    return 'An error occured while fetching your Linodes';
  } else if (loading) {
    return 'Loading your Linodes...';
  } else if (!filteredLinodes?.length) {
    return 'You have no Linodes to choose from';
  } else {
    return 'No options';
  }
};
