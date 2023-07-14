import Autocomplete from '@mui/material/Autocomplete';
import Popper from '@mui/material/Popper';
import * as React from 'react';

import { TextField } from 'src/components/TextField';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';

export interface Props {
  allowedRegions?: string[];
  disabled?: boolean;
  errorText?: string;
  filteredLinodes?: number[];
  helperText?: string;
  onBlur?: (e: React.FocusEvent) => void;
  onChange: (selected: number[]) => void;
  value: number[];
}

const LinodeMultiSelect = (props: Props) => {
  const {
    allowedRegions,
    disabled,
    errorText,
    filteredLinodes,
    helperText,
    onBlur,
    onChange,
    value,
  } = props;

  const regionFilter = allowedRegions
    ? {
        '+and': allowedRegions.map((regionId) => ({
          region: regionId,
        })),
      }
    : {};

  const { data, error, isLoading } = useAllLinodesQuery({}, regionFilter);

  const options = data
    ?.filter((linode) => !filteredLinodes?.includes(linode.id))
    .map(({ id, label }) => ({ id, label }));

  const selectedLinodeOptions =
    options?.filter((option) => value.includes(option.id)) ?? [];

  return (
    <Autocomplete
      PopperComponent={(popperProps) => (
        <Popper {...popperProps} data-qa-autocomplete-popper />
      )}
      onChange={(event, value) => {
        onChange(value.map((option) => option.id));
      }}
      renderInput={(params) => (
        <TextField
          errorText={error?.[0].reason ?? errorText}
          helperText={helperText}
          label="Linodes"
          loading={isLoading}
          placeholder="Select Linodes"
          {...params}
        />
      )}
      clearOnBlur
      disabled={disabled}
      loading={isLoading}
      multiple
      onBlur={onBlur}
      options={options ?? []}
      value={selectedLinodeOptions}
    />
  );
};

export default React.memo(LinodeMultiSelect);
