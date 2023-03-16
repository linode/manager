import * as React from 'react';
import { useInfiniteLinodesQuery } from 'src/queries/linodes';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from 'src/components/TextField';

export interface Props {
  allowedRegions?: string[];
  filteredLinodes?: number[];
  helperText?: string;
  onChange: (selected: number[]) => void;
  value: number[];
  errorText?: string;
  disabled?: boolean;
  onBlur?: (e: React.FocusEvent) => void;
}

const LinodeMultiSelect = (props: Props) => {
  const {
    allowedRegions,
    errorText,
    filteredLinodes,
    helperText,
    onChange,
    value,
    disabled,
    onBlur,
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

  const linodesFilter =
    filteredLinodes && filteredLinodes.length > 0
      ? { '+and': filteredLinodes.map((id) => ({ id: { '+neq': id } })) }
      : {};

  const regionFilter = allowedRegions
    ? {
        '+and': allowedRegions.map((regionId) => ({
          region: regionId,
        })),
      }
    : {};

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteLinodesQuery({
    ...searchFilter,
    ...regionFilter,
    ...linodesFilter,
  });

  const options = data?.pages
    .flatMap((page) => page.data)
    .map(({ id, label }) => ({ id, label }));

  const selectedLinodeOptions =
    options?.filter((option) => value.includes(option.id)) ?? [];

  return (
    <Autocomplete
      multiple
      clearOnBlur
      onBlur={(e) => {
        onBlur?.(e);
        setInputValue('');
      }}
      disabled={disabled}
      loading={isLoading}
      options={options ?? []}
      value={selectedLinodeOptions}
      onChange={(event, value) => {
        onChange(value.map((option) => option.id));
      }}
      inputValue={inputValue}
      onInputChange={(event, value, reason) => {
        if (reason !== 'reset') {
          setInputValue(value);
        }
      }}
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
      renderInput={(params) => (
        <TextField
          label="Linodes"
          placeholder="Select Linodes"
          loading={isLoading}
          errorText={error?.[0].reason ?? errorText}
          helperText={helperText}
          {...params}
        />
      )}
    />
  );
};

export default React.memo(LinodeMultiSelect);
