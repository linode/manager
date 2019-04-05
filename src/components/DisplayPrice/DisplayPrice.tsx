import * as React from 'react';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Currency from 'src/components/Currency';

type ClassNames = 'root' | 'price' | 'per';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  price: {
    fontSize: '1.5rem',
    color: theme.color.green,
    display: 'inline-block'
  },
  per: {
    color: theme.color.green,
    display: 'inline-block',
    fontWeight: 400
  }
});

interface Props {
  price: number;
  interval?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const displayPrice = (v: number) => `$${v.toFixed(2)}`;

export const DisplayPrice: React.StatelessComponent<CombinedProps> = props => {
  const { classes, interval, price } = props;
  return (
    <React.Fragment>
      <Typography
        variant="h3"
        className={classes.price}
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
