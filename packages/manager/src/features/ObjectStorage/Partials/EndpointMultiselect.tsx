import { Autocomplete } from '@linode/ui';
import * as React from 'react';

import { useObjectStorageEndpoints } from 'src/queries/object-storage/queries';

import type { SxProps, Theme } from '@linode/ui';

export interface EndpointMultiselectValue {
  label: string;
}

interface Props {
  disabled?: boolean;
  onChange: (value: EndpointMultiselectValue[]) => void;
  options?: EndpointMultiselectValue[];
  showLabel?: boolean;
  sx?: SxProps<Theme>;
  values: EndpointMultiselectValue[];
}

export const EndpointMultiselect = ({
  values,
  onChange,
  options,
  showLabel = false,
  sx,
  disabled = false,
}: Props) => {
  const { data: endpoints, isFetching } = useObjectStorageEndpoints(!options);
  const multiselectOptions = React.useMemo(
    () =>
      (endpoints ?? [])
        .filter((endpoint) => endpoint.s3_endpoint)
        .map((endpoint) => ({
          label: endpoint.s3_endpoint as string,
        })),
    [endpoints]
  );

  return (
    <Autocomplete
      disabled={isFetching || disabled}
      label={showLabel ? 'Endpoint' : ''}
      loading={isFetching}
      multiple
      noMarginTop={true}
      onChange={(_, newValues) => onChange(newValues)}
      options={options ? options : multiselectOptions}
      placeholder={
        isFetching
          ? `Loading S3 endpoints...`
          : 'Select an Object Storage S3 endpoint'
      }
      sx={sx}
      value={values}
    />
  );
};
