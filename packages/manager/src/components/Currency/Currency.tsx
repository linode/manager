import * as React from 'react';

interface CurrencyFormatterProps {
  quantity: number;
  decimalPlaces?: number;
  wrapInParentheses?: boolean;
}

export const Currency: React.FC<CurrencyFormatterProps> = (props) => {
  const { quantity, wrapInParentheses } = props;

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: props.decimalPlaces ?? 2,
  });

  const formattedQuantity = formatter.format(Math.abs(quantity));
  const isNegative = quantity < 0;

  let output;

  if (wrapInParentheses) {
    output = isNegative ? `-(${formattedQuantity})` : `(${formattedQuantity})`;
  } else {
    output = isNegative ? `-${formattedQuantity}` : formattedQuantity;
  }

  // eslint-disable-next-line
  return <span className="notranslate">{output}</span>;
};

export default React.memo(Currency);
