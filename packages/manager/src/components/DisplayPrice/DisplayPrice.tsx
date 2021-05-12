import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';

type ClassNames = 'root' | 'price' | 'per';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    price: {
      fontSize: '24px',
      color: theme.color.green,
      display: 'inline-block',
    },
    per: {
      color: theme.color.green,
      display: 'inline-block',
      fontWeight: 400,
    },
  });

interface Props {
  price: number;
  interval?: string;
  fontSize?: string; // optional override
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const displayPrice = (v: number) => `$${v.toFixed(2)}`;

export const DisplayPrice: React.FC<CombinedProps> = (props) => {
  const { classes, fontSize, interval, price } = props;
  return (
    <React.Fragment>
      <Typography
        variant="h3"
        className={classes.price}
        style={Boolean(fontSize) ? { fontSize } : undefined}
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

const styled = withStyles(styles);

export default styled(DisplayPrice);
