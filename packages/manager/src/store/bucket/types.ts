import { APIError } from 'linode-js-sdk/lib/types';

export interface BucketError {
  error: APIError;
  clusterId: string;
}
