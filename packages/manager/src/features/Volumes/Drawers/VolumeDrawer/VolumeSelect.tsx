import { useInfiniteVolumesQuery } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import * as React from 'react';

interface Props {
  disabled?: boolean;
  error?: string;
  name: string;
  onBlur: (e: any) => void;
  onChange: (volumeId: null | number) => void;
  region?: string;
  value: number;
}

export const VolumeSelect = (props: Props) => {
  const { disabled, error, name, onBlur, onChange, region, value } = props;

  const [inputValue, setInputValue] = React.useState<string>('');

  const searchFilter = inputValue
    ? {
        '+or': [
          { label: { '+contains': inputValue } },
          { tags: { '+contains': inputValue } },
        ],
      }
    : {};

  const { data, fetchNextPage, hasNextPage, isLoading } =
    useInfiniteVolumesQuery({
      ...searchFilter,
      ...(region ? { region } : {}),
      '+order': 'asc',
      // linode_id: null,  <- if the API let us, we would do this
      '+order_by': 'label',
    });

  const options = data?.pages
    .flatMap((page) => page.data)
    .map(({ id, label }) => ({ id, label }));

  const selectedVolume = options?.find((option) => option.id === value) ?? null;

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
      helperText={
        region && "Only volumes in this Linode's region are attachable."
      }
      onChange={(event, value) => {
        onChange(value?.id ?? -1);
        setInputValue('');
      }}
      onInputChange={(event, value, reason) => {
        if (reason === 'input') {
          setInputValue(value);
        } else {
          setInputValue('');
        }
      }}
      disabled={disabled}
      errorText={error}
      id={name}
      inputValue={selectedVolume ? selectedVolume.label : inputValue}
      isOptionEqualToValue={(option) => option.id === selectedVolume?.id}
      label="Volume"
      loading={isLoading}
      onBlur={onBlur}
      options={options ?? []}
      placeholder="Select a Volume"
      value={selectedVolume}
    />
  );
};
