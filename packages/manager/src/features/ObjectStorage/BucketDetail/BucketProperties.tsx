import { ObjectStorageEndpointTypes } from '@linode/api-v4';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account/account';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';

import { BucketRateLimitTable } from '../BucketLanding/BucketRateLimitTable';
import { BucketBreadcrumb } from './BucketBreadcrumb';
import {
  StyledActionsPanel,
  StyledHelperText,
  StyledRootContainer,
  StyledText,
} from './BucketProperties.styles';

interface Props {
  bucketName: string;
  clusterId: string;
  endpointType?: ObjectStorageEndpointTypes;
}

export const BucketProperties = React.memo((props: Props) => {
  const { bucketName, clusterId, endpointType } = props;
  const [updateRateLimitLoading] = React.useState(false);
  const [selectedRateLimit, setSelectedRateLimit] = React.useState<string>('1');

  const prefix = getQueryParamFromQueryString(location.search, 'prefix');
  const flags = useFlags();
  const { data: account } = useAccount();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  const { data: buckets } = useObjectStorageBuckets();

  const bucket = buckets?.buckets.find((bucket) => {
    if (isObjMultiClusterEnabled) {
      return bucket.label === bucketName && bucket.region === clusterId;
    }
    return bucket.label === bucketName && bucket.cluster === clusterId;
  });

  // TODO: OBJGen2 - Handle Get Bucket Rate Limit properties here.
  // React.useEffect(() => {
  // }, []);

  const handleSubmit = () => {
    // TODO: OBJGen2 - Handle update Bucket Rate Limit logic here.
  };

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
        {/* TODO: OBJGen2 - We need to handle link in upcoming PR */}
        <StyledHelperText>
          Specifies the maximum Requests Per Second (RPS) for an Endpoint. To
          increase it to High, open a <Link to="#">support ticket</Link>.
          Understand <Link to="#">bucket rate limits</Link>.
        </StyledHelperText>
        <BucketRateLimitTable
          onRateLimitChange={(selectedLimit: string) => {
            setSelectedRateLimit(selectedLimit);
          }}
          endpointType={endpointType}
          selectedRateLimit={selectedRateLimit}
        />
        <StyledActionsPanel
          primaryButtonProps={{
            disabled: !selectedRateLimit,
            label: 'Save',
            loading: updateRateLimitLoading,
            onClick: () => {
              handleSubmit();
            },
          }}
          style={{ padding: 0 }}
        />
      </StyledRootContainer>
    </>
  );
});
