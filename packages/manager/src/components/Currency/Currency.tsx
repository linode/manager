import { isNumber } from '@linode/utilities';
import * as React from 'react';

interface CurrencyFormatterProps {
  /**
   * Additional data attributes to pass in. For example, a data-testid
   */
  dataAttrs?: Record<string, any>;
  /**
   * The number of decimal places to display.
   */
  decimalPlaces?: number;
  /**
   * The amount (of money) to display in a currency format.
   */
  quantity: '--.--' | number;
  /**
   * A boolean used to wrap the currency in parenthesis. This is normally done to indicate a negative amount or balance.
   */
  wrapInParentheses?: boolean;
}

export const Currency = (props: CurrencyFormatterProps) => {
  const { dataAttrs, decimalPlaces, quantity, wrapInParentheses } = props;

  // Use the default value (2) when decimalPlaces is negative or undefined.
  const minimumFractionDigits =
    decimalPlaces !== undefined && decimalPlaces >= 0 ? decimalPlaces : 2;

  const formatter = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    minimumFractionDigits,
    style: 'currency',
  });

  const formattedQuantity = isNumber(quantity)
    ? formatter.format(Math.abs(quantity))
    : `$${quantity}`;
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
