import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from 'src/components/TextField';
import { useInfiniteVolumesQuery } from 'src/queries/volumes';

interface Props {
  error?: string;
  onChange: (volumeId: number | null) => void;
  onBlur: (e: any) => void;
  value: number;
  region?: string;
  disabled?: boolean;
}

const VolumeSelect = (props: Props) => {
  const { error, onBlur, disabled, onChange, value, region } = props;

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
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteVolumesQuery({
    ...searchFilter,
    ...(region ? { region } : {}),
    // linode_id: null,  <- if the API let us, we would do this
    '+order_by': 'label',
    '+order': 'asc',
  });

  const options = data?.pages
    .flatMap((page) => page.data)
    .map(({ id, label }) => ({ id, label }));

  const selectedVolume = options?.find((option) => option.id === value) ?? null;

  return (
    <Autocomplete
      disabled={disabled}
      options={options ?? []}
      value={selectedVolume}
      onChange={(event, value) => onChange(value?.id ?? -1)}
      inputValue={inputValue}
      onInputChange={(event, value) => {
        setInputValue(value);
      }}
      isOptionEqualToValue={(option) => option.id === selectedVolume?.id}
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
      loading={isLoading}
      renderInput={(params) => (
        <TextField
          label="Volume"
          placeholder="Select a Volume"
          helperText={
            region && "Only volumes in this Linode's region are attachable."
          }
          onBlur={onBlur}
          loading={isLoading}
          errorText={error}
          {...params}
        />
      )}
    />
  );
};

export default VolumeSelect;
