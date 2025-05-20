import { useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { BucketRateLimitTable } from '../BucketLanding/BucketRateLimitTable';
import { BucketBreadcrumb } from './BucketBreadcrumb';
import {
  StyledActionsPanel,
  StyledRootContainer,
  StyledText,
} from './BucketProperties.styles';

import type { ObjectStorageBucket } from '@linode/api-v4';

interface Props {
  bucket: ObjectStorageBucket;
}

export const BucketProperties = React.memo((props: Props) => {
  const { bucket } = props;
  const { endpoint_type, hostname, label } = bucket;
  const { prefix = '' } = useSearch({
    from: '/object-storage/buckets/$clusterId/$bucketName',
  });

  return (
    <>
      <BucketBreadcrumb bucketName={label} prefix={prefix} />
      <StyledText>{hostname}</StyledText>

      <StyledRootContainer>
        <BucketRateLimitTable
          endpointType={endpoint_type}
          typographyProps={{
            component: 'h3',
            variant: 'h3',
          }}
        />
        {/* TODO: OBJGen2 - This will be handled once we receive API for bucket rates */}
        <StyledActionsPanel
          primaryButtonProps={{
            disabled: true,
            label: 'Save',
            type: 'submit',
          }}
        />
      </StyledRootContainer>
    </>
  );
});
