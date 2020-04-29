import * as React from 'react';

interface CurrencyFormatterProps {
  quantity: number;
  decimalPlaces?: number;
  wrapInParentheses?: boolean;
}

type CombinedProps = CurrencyFormatterProps;

export const Currency: React.StatelessComponent<CombinedProps> = props => {
  const { quantity, wrapInParentheses } = props;

  const decimalPlaces = props.decimalPlaces ?? 2;
  const absoluteQuantity = Math.abs(quantity).toFixed(decimalPlaces);

  const isNegative = quantity < 0;

  const dollarAmount = wrapInParentheses
    ? `($${absoluteQuantity})`
    : `$${absoluteQuantity}`;

  const output = isNegative ? `-${dollarAmount}` : `${dollarAmount}`;

  // eslint-disable-next-line
  return <>{output}</>;
};

export default Currency;
