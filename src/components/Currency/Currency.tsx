import * as React from 'react';
import * as CurrencyFormatter from 'react-currency-formatter';

interface CurrencyFormatterProps {
  quantity: number;
  currency?: string;
  locale?: string;
  pattern?: string;
  decimal?: string;
  group?: string;
}

type CombinedProps = CurrencyFormatterProps;

export const Currency: React.StatelessComponent<CombinedProps> = props => (
  <CurrencyFormatter currency="USD" {...props} />
);

export default Currency;
