import { Autocomplete } from '@linode/ui';
import * as React from 'react';

import { useObjectStorageEndpoints } from 'src/queries/object-storage/queries';

export interface EndpointMultiselectValue {
  label: string;
}

interface Props {
  onChange: (value: EndpointMultiselectValue[]) => void;
  values: EndpointMultiselectValue[];
}

export const EndpointMultiselect = ({ values, onChange }: Props) => {
  const { data: endpoints, isFetching } = useObjectStorageEndpoints();
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
      disabled={isFetching}
      label=""
      loading={isFetching}
      multiple
      noMarginTop={true}
      onChange={(_, newValues) => onChange(newValues)}
      options={multiselectOptions}
      placeholder={
        isFetching
          ? `Loading S3 endpoints...`
          : !values.length
            ? 'Select an Object Storage S3 endpoint'
            : ''
      }
      value={values}
    />
  );
};
