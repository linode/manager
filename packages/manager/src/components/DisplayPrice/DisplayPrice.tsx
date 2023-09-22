import { SxProps, Theme, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Currency } from 'src/components/Currency';
import { Typography } from 'src/components/Typography';

export interface DisplayPriceProps {
  decimalPlaces?: number;
  fontSize?: string;
  interval?: string;
  price: number | string;
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
