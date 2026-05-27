import { isNumber } from '@akamai/compute-ui-core/formatting';
import * as React from 'react';

import { getAdaptiveDecimalPlacesCount } from 'src/utilities/pricing/priceInterval';

interface CurrencyFormatterProps {
  /**
   * Additional data attributes to pass in. For example, a data-testid
   */
  dataAttrs?: Record<string, any>;
  /**
   * The number of decimal places to display.
   * Defaults to 2 when not provided.
   */
  decimalPlaces?: number;
  /**
   * The amount (of money) to display in a currency format.
   */
  quantity: '--.--' | number;
  /**
   * When true, displays the value using its actual precision — integers show
   * without decimals ($10), non-integers use at least 2 decimal places and
   * expand for higher precision values ($10.50, $0.0159).
   * Has no effect when `decimalPlaces` is also provided.
   */
  useAdaptivePrecision?: boolean;
  /**
   * A boolean used to wrap the currency in parenthesis. This is normally done to indicate a negative amount or balance.
   */
  wrapInParentheses?: boolean;
}

export const Currency = (props: CurrencyFormatterProps) => {
  const {
    dataAttrs,
    decimalPlaces,
    quantity,
    useAdaptivePrecision,
    wrapInParentheses,
  } = props;

  const getMinimumFractionDigits = () => {
    if (decimalPlaces !== undefined && decimalPlaces >= 0) {
      return decimalPlaces;
    }
    if (useAdaptivePrecision && isNumber(quantity)) {
      return getAdaptiveDecimalPlacesCount(quantity);
    }
    return 2;
  };

  const formatter = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    minimumFractionDigits: getMinimumFractionDigits(),
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
