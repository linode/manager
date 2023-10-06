import { isNumber } from 'lodash';
import * as React from 'react';

import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';

interface CurrencyFormatterProps {
  dataAttrs?: Record<string, any>;
  decimalPlaces?: number;
  quantity: number | typeof UNKNOWN_PRICE;
  wrapInParentheses?: boolean;
}

export const Currency = (props: CurrencyFormatterProps) => {
  const { dataAttrs, quantity, wrapInParentheses } = props;

  const formatter = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    minimumFractionDigits: props.decimalPlaces ?? 2,
    style: 'currency',
  });

  const formattedQuantity = isNumber(quantity)
    ? formatter.format(Math.abs(quantity))
    : quantity;
  const isNegative = isNumber(quantity) ? quantity < 0 : false;

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
