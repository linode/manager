import { useRegionsQuery } from '@linode/queries';
import React from 'react';

import { LabelValue } from 'src/features/Delivery/Shared/LabelValue';

import type { LinodeObjectStorageDetails } from '@linode/api-v4';

export const DestinationLinodeObjectStorageDetailsSummary = (
  props: LinodeObjectStorageDetails
) => {
  const { bucket_name, host, region, path } = props;
  const { data: regions } = useRegionsQuery();

  const regionValue = regions?.find(({ id }) => id === region)?.label || region;

  return (
    <>
      <LabelValue label="Host" value={host} />
      <LabelValue label="Bucket" value={bucket_name} />
      <LabelValue label="Region" value={regionValue} />
      <LabelValue
        data-testid="access-key-id"
        label="Access Key ID"
        value="*****************"
      />
      <LabelValue
        data-testid="secret-access-key"
        label="Secret Access Key"
        value="*****************"
      />
      <LabelValue label="Log Path" value={path} />
    </>
  );
};
