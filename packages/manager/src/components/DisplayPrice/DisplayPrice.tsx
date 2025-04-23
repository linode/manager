import { Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Currency } from 'src/components/Currency';

import type { SxProps, Theme } from '@mui/material/styles';

export interface DisplayPriceProps {
  /**
   * The number of decimal places to display in the price.
   */
  decimalPlaces?: number;
  /**
   * The font size of the displayed price.
   */
  fontSize?: string;
  /**
   * The format interval to use for price formatting.
   * @example 'mo'
   * @example 'month'
   * @example 'year'
   */
  interval?: string;
  /**
   * The price to display.
   */
  price: '--.--' | number;
}

export const displayPrice = (price: number) => `$${price.toFixed(2)}`;

export const DisplayPrice = (props: DisplayPriceProps) => {
  const theme = useTheme<Theme>();
  const { decimalPlaces, fontSize, interval, price } = props;

  const sx: SxProps = {
    color: theme.palette.text.primary,
    display: 'inline-block',
    fontSize: fontSize ?? '1.125rem',
  };

  return (
    <>
      <Typography sx={sx} variant="h3">
        <Currency decimalPlaces={decimalPlaces} quantity={price} />
      </Typography>
      {interval && (
        <Typography sx={sx} variant="h3">
          /{interval}
        </Typography>
      )}
    </>
  );
};
