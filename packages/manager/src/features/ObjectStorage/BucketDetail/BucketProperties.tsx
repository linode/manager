import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account/account';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';

import { BucketBreadcrumb } from './BucketBreadcrumb';
import {
  StyledHelperText,
  StyledRootContainer,
  StyledText,
} from './BucketProperties.styles';
// import type { ACLType } from '@linode/api-v4/lib/object-storage';

interface Props {
  bucketName: string;
  clusterId: string;
}

export const BucketProperties = React.memo((props: Props) => {
  const { bucketName, clusterId } = props;
  const prefix = getQueryParamFromQueryString(location.search, 'prefix');
  const flags = useFlags();
  const { data: account } = useAccount();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  const { data: buckets } = useObjectStorageBuckets();

  //   console.log('hey', buckets)
  //   console.log('c', bucketName, clusterId)

  const bucket = buckets?.buckets.find((bucket) => {
    if (isObjMultiClusterEnabled) {
      return bucket.label === bucketName && bucket.region === clusterId;
    }
    return bucket.label === bucketName && bucket.cluster === clusterId;
  });

  //   console.log('test', bucket)

  return (
    <>
      <BucketBreadcrumb
        bucketName={bucketName}
        history={history}
        prefix={prefix}
      />
      <StyledText>{bucket?.hostname}</StyledText>

      <StyledRootContainer>
        <Typography variant="h2">Bucket Rate Limits</Typography>
        <StyledHelperText>
          Specifies the maximum Requests Per Second (RPS) for an Endpoint. To
          increase it to High, open a <Link to="#">support ticket</Link>.
          Understand <Link to="#">bucket rate limits</Link>.
        </StyledHelperText>
      </StyledRootContainer>
    </>
  );
});
