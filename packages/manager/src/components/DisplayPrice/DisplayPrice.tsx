import * as React from 'react';
import { Theme, makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  price: {
    fontSize: '1.5rem',
    color: theme.color.green,
    display: 'inline-block',
  },
  per: {
    color: theme.color.green,
    display: 'inline-block',
    fontWeight: 400,
  },
}));

interface Props {
  price: number;
  interval?: string;
  fontSize?: string; // optional override
  color?: string; // optional override
}

type CombinedProps = Props;

export const displayPrice = (v: number) => `$${v.toFixed(2)}`;

export const DisplayPrice: React.FC<CombinedProps> = (props) => {
  const { interval, price } = props;
  const classes = useStyles();
  const overrideStyle = {
    fontSize: props?.fontSize,
    color: props?.color,
  };
  return (
    <React.Fragment>
      <Typography
        variant="h3"
        className={classes.price}
        style={overrideStyle}
        qa-data-price={displayPrice(price)}
      >
        <Currency quantity={price} data-qa-currency-component />
      </Typography>
      {interval && (
        <Typography
          variant="h3"
          className={classes.per}
          qa-data-billing-interval={interval}
        >
          /{interval}
        </Typography>
      )}
    </React.Fragment>
  );
};

export default DisplayPrice;
