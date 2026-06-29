import { Autocomplete } from '@linode/ui';
import * as React from 'react';

import { useObjectStorageEndpointsQuery } from 'src/queries/object-storage/queries';

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
  optionsLoading?: boolean;
  showLabel?: boolean;
  sx?: SxProps<Theme>;
  values: EndpointMultiselectValue[];
}

export const EndpointMultiselect = ({
  values,
  onChange,
  options,
  optionsLoading = false,
  showLabel = false,
  sx,
  disabled = false,
}: Props) => {
  const { data: endpoints, isFetching } =
    useObjectStorageEndpointsQuery(!options);
  const multiselectOptions = React.useMemo(
    () =>
      options ??
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
    [endpoints, options]
  );

  optionsLoading = optionsLoading || isFetching;

  const sortedValues = React.useMemo(
    () => values.sort((a, b) => a.label.localeCompare(b.label)),
    [values]
  );

  return (
    <Autocomplete
      disabled={isFetching || disabled}
      label={showLabel ? 'Endpoints' : ''}
      loading={optionsLoading}
      multiple
      noMarginTop={true}
      onChange={(_, newValues) =>
        onChange(newValues.sort((a, b) => a.label.localeCompare(b.label)))
      }
      options={optionsLoading ? [] : multiselectOptions}
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
      value={sortedValues}
    />
  );
};
