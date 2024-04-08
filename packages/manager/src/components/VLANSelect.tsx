import React, { useState } from 'react';

import { useVLANsInfiniteQuery } from 'src/queries/vlans';

import { Autocomplete } from './Autocomplete/Autocomplete';

import type { Filter } from '@linode/api-v4';
import type { SxProps, Theme } from '@mui/material';

interface Props {
  /**
   * Disable the Select
   * @default false
   */
  disabled?: boolean;
  /**
   * An error that will show below the select
   */
  errorText?: string;
  /**
   * Default API filter
   */
  filter?: Filter;
  /**
   * Is called when a VLAN is selected
   */
  onChange?: (label: null | string) => void;
  /**
   * Optional Styles
   */
  sx?: SxProps<Theme>;
  /**
   * The label of the selected VLAN
   */
  value: null | string;
}

/**
 * A VLAN select component that has the following features
 * - Infinitely loads VLANs
 * - API filters VLANs when searching
 * - Allows VLAN creation
 */
export const VLANSelect = (props: Props) => {
  const { disabled, errorText, filter, onChange, sx, value } = props;

  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = useState<string>('');

  const apiFilter = getVLANSelectFilter({
    defaultFilter: filter,
    inputValue,
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useVLANsInfiniteQuery(apiFilter, open);

  const vlans = data?.pages.flatMap((page) => page.data) ?? [];

  const newVlanPlacehodler = {
    cidr_block: '',
    created: '',
    id: 0,
    label: inputValue,
    linodes: [],
    region: '',
  };

  const hasVLANWithExactLabel = vlans.some((vlan) => vlan.label === inputValue);

  if (!isFetching && inputValue && !hasVLANWithExactLabel) {
    vlans.push(newVlanPlacehodler);
  }

  const selectedVLAN = vlans?.find((option) => option.label === value) ?? null;

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
      getOptionLabel={(option) =>
        option === newVlanPlacehodler ? `Create "${inputValue}"` : option.label
      }
      isOptionEqualToValue={(option1, options2) =>
        option1.label === options2.label
      }
      onChange={(event, value) => {
        if (onChange) {
          onChange(value?.label ?? null);
        }
        if (value !== newVlanPlacehodler) {
          setInputValue('');
        }
      }}
      onClose={() => {
        setOpen(false);
      }}
      onInputChange={(_, value, reason) => {
        if (reason === 'input' || reason === 'clear') {
          setInputValue(value);
        }
      }}
      onOpen={() => {
        setOpen(true);
      }}
      disabled={disabled}
      errorText={errorText ?? error?.[0].reason}
      inputValue={selectedVLAN ? selectedVLAN.label : inputValue}
      label="VLAN"
      loading={isFetching}
      noOptionsText="You have no VLANs in this region. Type to create one."
      open={open}
      options={vlans}
      placeholder="Create or select a VLAN"
      sx={sx}
      value={selectedVLAN}
    />
  );
};

interface VLANSelectFilterOptions {
  defaultFilter?: Filter;
  inputValue: string;
}

export const getVLANSelectFilter = (options: VLANSelectFilterOptions) => {
  const { defaultFilter, inputValue } = options;

  const baseFilter = defaultFilter ?? {};

  if (inputValue) {
    return {
      ...baseFilter,
      label: { '+contains': inputValue },
    };
  }

  return baseFilter;
};
