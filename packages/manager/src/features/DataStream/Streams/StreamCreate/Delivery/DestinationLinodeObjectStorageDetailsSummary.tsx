import { useRegionsQuery } from '@linode/queries';
import React from 'react';

import { DestinationDetail } from 'src/features/DataStream/Streams/StreamCreate/Delivery/DestinationDetail';

import type { LinodeObjectStorageDetails } from '@linode/api-v4';

export const DestinationLinodeObjectStorageDetailsSummary = (
  props: LinodeObjectStorageDetails
) => {
  const { bucket_name, host, region, path } = props;
  const { data: regions } = useRegionsQuery();

  const regionValue = regions?.find(({ id }) => id === region)?.label || region;

  return (
    <>
      <DestinationDetail label="Host" value={host} />
      <DestinationDetail label="Bucket" value={bucket_name} />
      <DestinationDetail label="Region" value={regionValue} />
      <DestinationDetail label="Access Key ID" value="*****************" />
      <DestinationDetail label="Secret Access Key" value="*****************" />
      <DestinationDetail label="Log path" value={path} />
    </>
  );
};
