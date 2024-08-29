import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useHistory, useLocation } from 'react-router-dom';

import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { SupportLink } from 'src/components/SupportLink';
import { Typography } from 'src/components/Typography';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';

import { BucketRateLimitTable } from '../BucketLanding/BucketRateLimitTable';
import { BucketBreadcrumb } from './BucketBreadcrumb';
import {
  StyledActionsPanel,
  StyledHelperText,
  StyledRootContainer,
  StyledText,
} from './BucketProperties.styles';

import type {
  ObjectStorageBucket,
  UpdateBucketRateLimitPayload,
} from '@linode/api-v4';

interface Props {
  bucket: ObjectStorageBucket;
}

export const BucketProperties = React.memo((props: Props) => {
  const { bucket } = props;
  const { endpoint_type, hostname, label } = bucket;

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

  const onSubmit = () => {
    // TODO: OBJGen2 - Handle Bucket Rate Limit update logic once the endpoint for updating is available.
    // The 'data' argument is expected -> data: UpdateBucketRateLimitPayload
  };

  return (
    <FormProvider {...form}>
      <BucketBreadcrumb bucketName={label} history={history} prefix={prefix} />
      <StyledText>{hostname || 'Loading...'}</StyledText>

      <StyledRootContainer>
        <Typography variant="h2">Bucket Rate Limits</Typography>

        {errors.root?.message ? (
          <Notice text={errors.root?.message} variant="error" />
        ) : null}

        {/* TODO: OBJGen2 - We need to handle link in upcoming PR */}
        <StyledHelperText>
          Specifies the maximum Requests Per Second (RPS) for an Endpoint. To
          increase it to High,{' '}
          <SupportLink
            text="open a support ticket"
            title="Request to Increase Bucket Rate Limits"
          />
          . Understand <Link to="#">bucket rate limits</Link>.
        </StyledHelperText>

        <form onSubmit={handleSubmit(onSubmit)}>
          <BucketRateLimitTable endpointType={endpoint_type} />
          <StyledActionsPanel
            primaryButtonProps={{
              disabled: !isDirty,
              label: 'Save',
              loading: isSubmitting,
              type: 'submit',
            }}
          />
        </form>
      </StyledRootContainer>
    </FormProvider>
  );
});
