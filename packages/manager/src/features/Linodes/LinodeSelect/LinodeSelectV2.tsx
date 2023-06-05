/**
 * The plan is to eventually replace the existing `LinodeSelect` and
 * `LinodeMultiSelect` components with this one. Once that happens,
 * remove 'V2' from this component's name.
 */

import { APIError, Filter, Linode } from '@linode/api-v4';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Autocomplete,
  Box,
  Popper,
  PopperProps,
  useTheme,
} from '@mui/material';
import React from 'react';
import TextField from 'src/components/TextField';
import { useInfiniteLinodesQuery } from 'src/queries/linodes/linodes';
import { mapIdsToLinodes } from 'src/utilities/mapIdsToLinodes';

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
  /* Called when the value changes */
  handleChange: (selected: Linode[]) => void;
  /* Enable multi-select. */
  multiple: true;
  /* Current value of the input. */
  value: number[];
}

export interface LinodeSingleSelectProps extends LinodeSelectProps {
  /* Called when the value changes */
  handleChange: (selected: Linode | null) => void;
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
    disabled,
    errorText,
    filter,
    handleChange,
    helperText,
    loading,
    multiple,
    noOptionsMessage,
    onBlur,
    optionsFilter,
    placeholder,
    value,
  } = props;

  const {
    data: linodesData,
    isLoading: linodesDataLoading,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteLinodesQuery(filter);

  const theme = useTheme();

  const linodes = linodesData?.pages.flatMap((page) => page.data);
  const filteredLinodes = optionsFilter
    ? linodes?.filter(optionsFilter)
    : linodes;

  return (
    <Autocomplete
      value={mapIdsToLinodes(value, linodes)}
      options={filteredLinodes ?? []}
      getOptionLabel={(linode) => linode.label}
      clearOnBlur
      multiple={multiple}
      loading={linodesDataLoading || loading}
      disabled={disabled}
      onChange={(_, value) =>
        multiple && Array.isArray(value)
          ? handleChange(value)
          : !multiple && !Array.isArray(value) && handleChange(value)
      }
      onBlur={onBlur}
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
      renderInput={(params) => (
        <TextField
          label="Linodes"
          placeholder={
            placeholder ?? multiple ? 'Select Linodes' : 'Select a Linode'
          }
          loading={linodesDataLoading}
          errorText={error?.[0].reason ?? errorText}
          helperText={helperText}
          {...params}
        />
      )}
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
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Box
            component={DoneIcon}
            sx={{ width: 17, height: 17, mr: '5px', ml: '-2px' }}
            style={{
              visibility: selected ? 'visible' : 'hidden',
            }}
          />
          <Box
            sx={{
              flexGrow: 1,
              '& span': {
                color: theme.palette.mode === 'light' ? '#586069' : '#8b949e',
              },
            }}
          >
            {option.label}
          </Box>
          {multiple && (
            <Box
              component={CloseIcon}
              sx={{ opacity: 0.6, width: 18, height: 18 }}
              style={{
                visibility: selected ? 'visible' : 'hidden',
              }}
            />
          )}
        </li>
      )}
      PopperComponent={CustomPopper}
      popupIcon={<KeyboardArrowDownIcon />}
    />
  );
};

const CustomPopper = (props: PopperProps) => {
  return (
    <Popper
      {...props}
      data-qa-autocomplete-popper
      modifiers={[{ name: 'preventOverflow', enabled: false }]}
      style={{
        ...(props.style ?? {}),
        ...(props.style?.width
          ? typeof props.style.width == 'string'
            ? { width: `calc(${props.style.width} + 2px)` }
            : { width: props.style.width + 2 }
          : {}),
      }}
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
