import { APIError } from 'linode-js-sdk/lib/types';

export const baseGaugeProps = {
  height: 110,
  width: '100%'
};

export interface BaseProps {
  clientID: number;
  lastUpdatedError?: APIError[];
}
