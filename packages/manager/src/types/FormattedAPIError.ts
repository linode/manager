import { APIError } from '@linode/api-v4';

export interface FormattedAPIError extends APIError {
  formattedReason: JSX.Element | string;
}
