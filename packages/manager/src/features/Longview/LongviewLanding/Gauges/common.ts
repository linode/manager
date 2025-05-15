import type { APIError } from '@linode/api-v4/lib/types';

export const baseGaugeProps = {
  height: 110,
  width: '100%',
};

export interface BaseProps {
  clientID: number;
  lastUpdatedError?: APIError[];
}
