import { APIError } from '@linode/api-v4';

export const baseGaugeProps = {
  height: 110,
  width: '100%',
};

export interface BaseProps {
  clientID: number;
  lastUpdatedError?: APIError[];
}
