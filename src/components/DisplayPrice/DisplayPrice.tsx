import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

type ClassNames = 'root' | 'price' | 'per';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
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
});

interface Props {
  price: number;
  interval?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const displayPrice = (v: number) => `$${v.toFixed(2)}`;

export const DisplayPrice: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, interval, price } = props;
  return (
    <React.Fragment>
      <Typography role="header" variant="subheading" className={classes.price}>
        {displayPrice(price)}
      </Typography>
      {interval &&
        <Typography role="header" variant="subheading" className={classes.per}>
          /{interval}
        </Typography>
      }
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(DisplayPrice);
