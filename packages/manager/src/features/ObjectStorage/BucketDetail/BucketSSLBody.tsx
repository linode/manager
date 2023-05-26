import * as React from 'react';
import { AddCertForm, RemoveCertForm } from './BucketSSLCertForms';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { getSSLCert } from '@linode/api-v4/lib/object-storage';
import { useAPIRequest } from 'src/hooks/useAPIRequest';

export interface BucketSSLBodyProps {
  bucketName: string;
  clusterId: string;
}

export const BucketSSLBody = (props: BucketSSLBodyProps) => {
  const { bucketName, clusterId } = props;

  const request = useAPIRequest(
    () => getSSLCert(clusterId, bucketName).then((response) => response.ssl),
    false
  );

  const hasSSL = request.data;

  if (request.loading) {
    return <CircleProgress />;
  }

  if (request.error) {
    return <ErrorState errorText="Error loading TLS cert data" />;
  }

  if (hasSSL) {
    return <RemoveCertForm {...props} update={request.update} />;
  }

  return <AddCertForm {...props} update={request.update} />;
};
