import * as React from 'react';
import { SxProps, Theme, useTheme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { Currency } from 'src/components/Currency';

export interface DisplayPriceProps {
  price: number;
  interval?: string;
  fontSize?: string;
}

export const displayPrice = (price: number) => `$${price.toFixed(2)}`;

export const DisplayPrice = (props: DisplayPriceProps) => {
  const theme = useTheme<Theme>();
  const { interval, price, fontSize } = props;

  const sx: SxProps = {
    display: 'inline-block',
    color: theme.palette.text.primary,
    fontSize: fontSize ?? '1.125rem',
  };

  return (
    <>
      <Typography sx={sx} variant="h3">
        <Currency quantity={price} />
      </Typography>
      {interval && (
        <Typography sx={sx} variant="h3">
          /{interval}
        </Typography>
      )}
    </>
  );
};
