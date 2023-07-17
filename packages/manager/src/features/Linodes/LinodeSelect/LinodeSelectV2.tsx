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

interface LinodeSelectProps {
  /** Disable editing the input value. */
  disabled?: boolean;
  /** Hint displayed with error styling. */
  errorText?: string;
  /** Filter sent to the API when retrieving account Linodes. */
  filter?: Filter;
  /** Hint displayed in normal styling. */
  helperText?: string;
  /** Adds styling to indicate a loading state. */
  loading?: boolean;
  /** Message displayed when no options match the user's search. */
  noOptionsMessage?: string;
  /** Called when the input loses focus. */
  onBlur?: (e: React.FocusEvent) => void;
  /** Determine which Linodes should be available as options. */
  optionsFilter?: (linode: Linode) => boolean;
  /* Displayed when the input is blank. */
  placeholder?: string;
  /* Displays an indication that the input is required. */
  required?: boolean;
}

export interface LinodeMultiSelectProps extends LinodeSelectProps {
  /* Enable multi-select. */
  multiple: true;
  /* Called when the value changes */
  onSelectionChange: (selected: Linode[]) => void;
  /* Current value of the input. */
  value: number[];
}

export interface LinodeSingleSelectProps extends LinodeSelectProps {
  /* Enable single-select. */
  multiple?: false;
  /* Called when the value changes */
  onSelectionChange: (selected: Linode | null) => void;
  /* Current value of the input. */
  value: null | number;
}

/**
 * A select input allowing selection between account Linodes.
 */
export const LinodeSelectV2 = (
  props: LinodeMultiSelectProps | LinodeSingleSelectProps
) => {
  const {
    disabled,
    errorText,
    filter,
    helperText,
    loading,
    multiple,
    noOptionsMessage,
    onBlur,
    onSelectionChange,
    optionsFilter,
    placeholder,
    value,
  } = props;

  const {
    data: linodesData,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading: linodesDataLoading,
  } = useInfiniteLinodesQuery(filter);

  const linodes = linodesData?.pages.flatMap((page) => page.data);
  const filteredLinodes = optionsFilter
    ? linodes?.filter(optionsFilter)
    : linodes;

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
        <i>
          {noOptionsMessage ??
            getDefaultNoOptionsMessage(
              error,
              linodesDataLoading,
              filteredLinodes
            )}
        </i>
      }
      onChange={(_, value) =>
        multiple && Array.isArray(value)
          ? onSelectionChange(value)
          : !multiple && !Array.isArray(value) && onSelectionChange(value)
      }
      renderInput={(params) => (
        <TextField
          placeholder={
            placeholder ?? multiple ? 'Select Linodes' : 'Select a Linode'
          }
          errorText={error?.[0].reason ?? errorText}
          helperText={helperText}
          inputId={params.id}
          label="Linodes"
          loading={linodesDataLoading}
          {...params}
        />
      )}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <SelectedIcon visible={selected} />
          <Box
            sx={{
              flexGrow: 1,
            }}
          >
            {option.label}
          </Box>
          {multiple && <RemoveIcon visible={selected} />}
        </li>
      )}
      ChipProps={{ deleteIcon: <CloseIcon /> }}
      PopperComponent={CustomPopper}
      clearOnBlur
      disableCloseOnSelect={multiple}
      disabled={disabled}
      getOptionLabel={(linode) => linode.label}
      loading={linodesDataLoading || loading}
      multiple={multiple}
      onBlur={onBlur}
      options={filteredLinodes ?? []}
      popupIcon={<KeyboardArrowDownIcon />}
      value={mapIdsToLinodes(value, linodes)}
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
