import * as React from 'react';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import Autocomplete from '@mui/material/Autocomplete';
import Popper from '@mui/material/Popper';
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

  const regionFilter = allowedRegions
    ? {
        '+and': allowedRegions.map((regionId) => ({
          region: regionId,
        })),
      }
    : {};

  const { data, isLoading, error } = useAllLinodesQuery({}, regionFilter);

  const options = data
    ?.filter((linode) => !filteredLinodes?.includes(linode.id))
    .map(({ id, label }) => ({ id, label }));

  const selectedLinodeOptions =
    options?.filter((option) => value.includes(option.id)) ?? [];

  return (
    <Autocomplete
      multiple
      clearOnBlur
      onBlur={onBlur}
      disabled={disabled}
      loading={isLoading}
      options={options ?? []}
      value={selectedLinodeOptions}
      onChange={(event, value) => {
        onChange(value.map((option) => option.id));
      }}
      PopperComponent={(popperProps) => (
        <Popper {...popperProps} data-qa-autocomplete-popper />
      )}
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
