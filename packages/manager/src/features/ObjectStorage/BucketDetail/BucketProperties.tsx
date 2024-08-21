import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useHistory, useLocation } from 'react-router-dom';

import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
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

import type { ObjectStorageEndpointTypes } from '@linode/api-v4';

interface Props {
  bucketName: string;
  clusterId: string;
  endpointType?: ObjectStorageEndpointTypes;
}

export interface UpdateBucketRateLimitPayload {
  rateLimit: string;
}

export const BucketProperties = React.memo((props: Props) => {
  const { bucketName, clusterId, endpointType } = props;

  const form = useForm<UpdateBucketRateLimitPayload>({
    defaultValues: {
      rateLimit: '1',
    },
  });

  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
  } = form;

  const location = useLocation();
  const history = useHistory();
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

  const onSubmit = () => {
    // TODO: OBJGen2 - Handle Bucket Rate Limit update logic once the endpoint for updating is available.
    // The 'data' argument is expected -> data: UpdateBucketRateLimitPayload
  };

  return (
    <FormProvider {...form}>
      <BucketBreadcrumb
        bucketName={bucketName}
        history={history}
        prefix={prefix}
      />
      <StyledText>{bucket?.hostname || 'Loading...'}</StyledText>

      <StyledRootContainer>
        <Typography variant="h2">Bucket Rate Limits</Typography>

        {errors.root?.message ? (
          <Notice text={errors.root?.message} variant="error" />
        ) : null}

        {/* TODO: OBJGen2 - We need to handle link in upcoming PR */}
        <StyledHelperText>
          Specifies the maximum Requests Per Second (RPS) for an Endpoint. To
          increase it to High, open a <Link to="#">support ticket</Link>.
          Understand <Link to="#">bucket rate limits</Link>.
        </StyledHelperText>

        <form onSubmit={handleSubmit(onSubmit)}>
          <BucketRateLimitTable endpointType={endpointType} />
          <StyledActionsPanel
            primaryButtonProps={{
              disabled: !isDirty,
              label: 'Save',
              loading: isSubmitting,
              type: 'submit',
            }}
            style={{ padding: 0 }}
          />
        </form>
      </StyledRootContainer>
    </FormProvider>
  );
});
