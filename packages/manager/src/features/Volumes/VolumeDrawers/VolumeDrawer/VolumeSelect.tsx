import { useAllVolumesQuery, useVolumeQuery } from '@linode/queries';
import { Autocomplete } from '@linode/ui';
import { useDebouncedValue } from '@linode/utilities';
import * as React from 'react';

import { useQueryWithPermissions } from 'src/features/IAM/hooks/usePermissions';

import type { Volume } from '@linode/api-v4';

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

  const query = useAllVolumesQuery(
    {},
    {
      ...(region ? { region } : {}),
    }
  );

  const { data: availableVolumes, isLoading: isAvailableVolumesLoading } =
    useQueryWithPermissions<Volume>(query, 'volume', ['attach_volume']);

  const debouncedInputValue = useDebouncedValue(inputValue);

  const filteredVolumes = React.useMemo(() => {
    if (!availableVolumes) return [];

    return availableVolumes.filter((volume) => {
      // Filter out volumes that are already attached to a Linode
      if (volume.linode_id) return false;

      if (debouncedInputValue) {
        const searchTerm = debouncedInputValue.toLowerCase();
        const matchesLabel = volume.label.toLowerCase().includes(searchTerm);
        const matchesTags = volume.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm)
        );

        if (!matchesLabel && !matchesTags) return false;
      }

      return true;
    });
  }, [availableVolumes, debouncedInputValue]);

  const { data: volume, isLoading: isLoadingSelected } = useVolumeQuery(
    value,
    value > 0
  );

  if (
    value &&
    volume &&
    !filteredVolumes?.some((item) => item.id === volume.id)
  ) {
    filteredVolumes?.push(volume);
  }

  const selectedVolume =
    filteredVolumes?.find((option) => option.id === value) ?? null;

  return (
    <Autocomplete
      disabled={disabled || isAvailableVolumesLoading}
      errorText={error}
      filterOptions={(filteredVolumes) => filteredVolumes}
      helperText={
        region && "Only volumes in this Linode's region are attachable."
      }
      id={name}
      inputValue={selectedVolume ? selectedVolume.label : inputValue}
      isOptionEqualToValue={(option) => option.id === selectedVolume?.id}
      label="Volume"
      loading={isLoadingSelected || isAvailableVolumesLoading}
      onBlur={onBlur}
      onChange={(_, value) => {
        setInputValue('');
        onChange(value?.id ?? -1);
      }}
      onInputChange={(_, value, reason) => {
        if (reason === 'input') {
          setInputValue(value);
        } else {
          setInputValue('');
        }
      }}
      options={filteredVolumes ?? []}
      placeholder="Select a Volume"
      value={selectedVolume}
    />
  );
};
