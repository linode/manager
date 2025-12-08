import React from 'react';

import { LabelValue } from 'src/features/Delivery/Shared/LabelValue';

import type { AkamaiObjectStorageDetails } from '@linode/api-v4';

export const DestinationAkamaiObjectStorageDetailsSummary = (
  props: AkamaiObjectStorageDetails
) => {
  const { bucket_name, host, path } = props;

  return (
    <>
      <LabelValue label="Host" value={host} />
      <LabelValue label="Bucket" value={bucket_name} />
      <LabelValue
        data-testid="access-key-id"
        label="Access Key ID"
        smHideTooltip={true}
        value="*****************"
      />
      <LabelValue
        data-testid="secret-access-key"
        label="Secret Access Key"
        smHideTooltip={true}
        value="*****************"
      />
      {!!path && <LabelValue label="Log Path" value={path} />}
    </>
  );
};
