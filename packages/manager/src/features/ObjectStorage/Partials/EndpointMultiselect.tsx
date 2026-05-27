import { Autocomplete } from '@linode/ui';
import * as React from 'react';

import { useObjectStorageEndpoints } from 'src/queries/object-storage/queries';

import type { ObjectStorageEndpoint } from '@linode/api-v4';
import type { SxProps, Theme } from '@linode/ui';

export interface EndpointMultiselectValue {
  endpoint: ObjectStorageEndpoint;
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
      ((endpoints ?? []) as ObjectStorageEndpoint[])
        .filter((endpoint) => endpoint.s3_endpoint)
        .map(
          (endpoint) =>
            ({
              endpoint,
              label: endpoint.s3_endpoint as string,
            }) as EndpointMultiselectValue
        )
        .sort((a, b) => (a.label > b.label ? 1 : -1)),
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
      sx={{
        maxWidth: '100%',
        '& .MuiInput-root': {
          maxWidth: 'none',
        },
        ...sx,
      }}
      value={values}
    />
  );
};
