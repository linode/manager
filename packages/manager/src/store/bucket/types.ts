import { APIError } from '@linode/api-v4/lib/types';

export interface BucketError {
  error: APIError;
  clusterId: string;
}
