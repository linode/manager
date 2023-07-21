import { APIError, Filter, Linode } from '@linode/api-v4';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Autocomplete } from '@mui/material';
import { SxProps } from '@mui/system';
import React from 'react';

import { Box } from 'src/components/Box';
import { TextField } from 'src/components/TextField';
import { useInfiniteLinodesQuery } from 'src/queries/linodes/linodes';
import { mapIdsToLinodes } from 'src/utilities/mapIdsToLinodes';

import { CustomPopper, SelectedIcon } from './LinodeSelect.styles';

interface LinodeSelectProps {
  /** Whether to display the clear icon. Defaults to `true`. */
  clearable?: boolean;
  /** Disable editing the input value. */
  disabled?: boolean;
  /** Hint displayed with error styling. */
  errorText?: string;
  /** Filter sent to the API when retrieving account Linodes. */
  filter?: Filter;
  /** Hint displayed in normal styling. */
  helperText?: string;
  /** The ID of the input. */
  id?: string;
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
  /* Render a custom option. */
  renderOption?: (linode: Linode, selected: boolean) => JSX.Element;
  /* Render a custom option label. */
  renderOptionLabel?: (linode: Linode) => string;
  /* Displays an indication that the input is required. */
  required?: boolean;
  /** Overrides the default label. */
  showIPAddressLabel?: boolean;
  /* Adds custom styles to the component. */
  sx?: SxProps;
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
export const LinodeSelect = (
  props: LinodeMultiSelectProps | LinodeSingleSelectProps
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
    options,
    optionsFilter,
    placeholder,
    renderOption,
    renderOptionLabel,
    sx,
    value,
  } = props;

  const {
    data: linodesData,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading: linodesDataLoading,
  } = useInfiniteLinodesQuery(filter);

  const [inputValue, setInputValue] = React.useState('');

  const linodes = linodesData?.pages.flatMap((page) => page.data);

  const filteredLinodes = optionsFilter
    ? linodes?.filter(optionsFilter)
    : linodes;

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
      getOptionLabel={(linode: Linode) =>
        renderOptionLabel ? renderOptionLabel(linode) : linode.label
      }
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
            placeholder || multiple ? 'Select Linodes' : 'Select a Linode'
          }
          errorText={error?.[0].reason ?? errorText}
          helperText={helperText}
          inputId={params.id}
          label={multiple ? 'Linodes' : 'Linode'}
          loading={linodesDataLoading}
          noMarginTop={noMarginTop}
          {...params}
        />
      )}
      renderOption={(props, option, { selected }) => {
        return (
          <li {...props}>
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
          </li>
        );
      }}
      ChipProps={{ deleteIcon: <CloseIcon /> }}
      PopperComponent={CustomPopper}
      clearOnBlur={false}
      disableClearable={!clearable}
      disableCloseOnSelect={multiple}
      disablePortal={true}
      disabled={disabled}
      id={id}
      inputValue={inputValue}
      loading={linodesDataLoading || loading}
      multiple={multiple}
      onBlur={onBlur}
      onInputChange={(_, value) => setInputValue(value)}
      options={options || (filteredLinodes ?? [])}
      popupIcon={<KeyboardArrowDownIcon />}
      sx={sx}
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
