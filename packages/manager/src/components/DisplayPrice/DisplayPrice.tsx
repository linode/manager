import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';

const useStyles = makeStyles((theme: Theme) => ({
  price: {
    display: 'inline-block',
    color: theme.palette.text.primary,
    fontSize: '1.125rem',
  },
}));

interface Props {
  price: number;
  interval?: string;
  fontSize?: string; // optional override
}

type CombinedProps = Props;

export const displayPrice = (v: number) => `$${v.toFixed(2)}`;

export const DisplayPrice: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { interval, price } = props;

  const overrideStyle = {
    fontSize: props?.fontSize,
  };

  return (
    <>
      <Typography
        className={classes.price}
        style={overrideStyle}
        variant="h3"
        qa-data-price={displayPrice(price)}
      >
        <Currency quantity={price} data-qa-currency-component />
      </Typography>
      {interval && (
        <Typography
          className={classes.price}
          style={overrideStyle}
          variant="h3"
          qa-data-billing-interval={interval}
        >
          /{interval}
        </Typography>
      )}
    </>
  );
};

export default DisplayPrice;
