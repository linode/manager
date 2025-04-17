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
  const { data, fetchNextPage, hasNextPage, isLoading } =
    useInfiniteVolumesQuery({
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
      disabled={disabled}
      errorText={error}
      helperText={
        region && "Only volumes in this Linode's region are attachable."
      }
      id={name}
      inputValue={selectedVolume ? selectedVolume.label : inputValue}
      isOptionEqualToValue={(option) => option.id === selectedVolume?.id}
      label="Volume"
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
      onBlur={onBlur}
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
      options={options ?? []}
      placeholder="Select a Volume"
      value={selectedVolume}
    />
  );
};
