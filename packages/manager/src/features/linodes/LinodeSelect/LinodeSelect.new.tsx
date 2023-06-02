/**
 * The plan is to eventually replace the existing `LinodeSelect` and
 * `LinodeMultiSelect` components with this one. Once that happens,
 * remove 'new' from this component's name.
 */

import { Filter, Linode } from '@linode/api-v4';
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
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';

export type LinodeSelectProps = {
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  onBlur?: (e: React.FocusEvent) => void;
  filter?: Filter;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  noOptionsMessage?: string;
  optionsFilter?: (linode: Linode) => boolean;
} & (LinodeMultiSelectProps | LinodeSingleSelectProps);

interface LinodeMultiSelectProps {
  multiple: true;
  value: number[];
  handleChange: (selected: Linode[]) => void;
}

interface LinodeSingleSelectProps {
  multiple?: false;
  value: number | null;
  handleChange: (selected: Linode | null) => void;
}

export const LinodeSelectNew = (props: LinodeSelectProps) => {
  const {
    value,
    handleChange,
    multiple,
    disabled,
    loading,
    onBlur,
    filter,
    placeholder,
    helperText,
    errorText,
    noOptionsMessage,
    optionsFilter,
  } = props;

  const {
    data: linodesData,
    isLoading: linodesDataLoading,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteLinodesQuery(filter);

  const [inputValue, setInputValue] = React.useState('');

  const theme = useTheme();

  const linodes = linodesData?.pages.flatMap((page) => page.data);
  const filteredLinodes = optionsFilter
    ? linodes?.filter(optionsFilter)
    : linodes;

  const defaultNoOptionsMessage =
    !error && !linodesDataLoading && !filteredLinodes?.length
      ? 'You have no Linodes to choose from'
      : 'No options';

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
      inputValue={inputValue}
      noOptionsText={noOptionsMessage ?? defaultNoOptionsMessage}
      onInputChange={(_, input) => {
        setInputValue(input);
      }}
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

// Maps ids in the format expected by MUI Autocomplete
const mapIdsToLinodes = (
  ids: number[] | number | null,
  linodes: Linode[] = []
): Linode[] | Linode | null => {
  const linodeMap = new Map(linodes.map((linode) => [linode.id, linode]));
  if (Array.isArray(ids)) {
    return ids.map((id) => linodeMap.get(id)).filter(isNotNullOrUndefined);
  } else if (ids !== null) {
    return linodeMap.get(ids) ?? null;
  } else {
    return null;
  }
};
