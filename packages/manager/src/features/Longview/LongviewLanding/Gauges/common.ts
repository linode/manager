import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const baseGaugeProps = {
  height: 110,
  width: '100%',
};

export interface BaseProps {
  clientID: number;
  lastUpdatedError?: FormattedAPIError[];
}
