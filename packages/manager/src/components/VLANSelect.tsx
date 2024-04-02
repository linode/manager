import React from 'react';
import { useState } from 'react';

import { VLANFactory } from 'src/factories';
import { useVLANsInfiniteQuery } from 'src/queries/vlans';

import { Autocomplete } from './Autocomplete/Autocomplete';

import type { SxProps, Theme } from '@mui/material';

interface Props {
  /**
   * An error that will show below the select
   */
  errorText?: string;
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

export const VLANSelect = (props: Props) => {
  const [inputValue, setInputValue] = useState<string>('');

  const searchFilter = inputValue ? { label: { '+contains': inputValue } } : {};

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useVLANsInfiniteQuery(searchFilter);

  const vlans = data?.pages.flatMap((page) => page.data) ?? [];

  const newVlanPlacehodler = VLANFactory.build({
    label: inputValue,
  });

  const options = [...vlans];

  if (vlans.length === 0 && !isLoading && inputValue) {
    options.push(newVlanPlacehodler);
  }

  const selectedVLAN =
    options?.find((option) => option.label === props.value) ?? null;

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
        if (props.onChange) {
          props.onChange(value?.label ?? null);
        }
      }}
      onInputChange={(_, value, reason) => {
        if (reason === 'input' || reason === 'clear') {
          setInputValue(value);
        }
      }}
      errorText={props.errorText ?? error?.[0].reason}
      inputValue={selectedVLAN ? selectedVLAN.label : inputValue}
      label="VLAN"
      loading={isLoading}
      options={options}
      placeholder="Create or select a VLAN"
      sx={props.sx}
      value={selectedVLAN}
    />
  );
};
