import * as React from 'react';

interface CurrencyFormatterProps {
  quantity: number;
  decimalPlaces?: number;
  wrapInParentheses?: boolean;
  dataAttrs?: Record<string, any>;
}

export const Currency = (props: CurrencyFormatterProps) => {
  const { dataAttrs, quantity, wrapInParentheses } = props;

  const formatter = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    minimumFractionDigits: props.decimalPlaces ?? 2,
    style: 'currency',
  });

  const formattedQuantity = formatter.format(Math.abs(quantity));
  const isNegative = quantity < 0;

  let output;

  if (wrapInParentheses) {
    output = isNegative ? `-(${formattedQuantity})` : `(${formattedQuantity})`;
  } else {
    output = isNegative ? `-${formattedQuantity}` : formattedQuantity;
  }

  return (
    <span className="notranslate" {...dataAttrs}>
      {output}
    </span>
  );
};
