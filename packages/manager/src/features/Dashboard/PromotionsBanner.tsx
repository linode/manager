import * as moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';

import AttachMoney from '@material-ui/icons/AttachMoney';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';

/**
 * We may want to only display this component
 * for credits that will be expiring in the near
 * future; setting a threshold here will hide
 * the banner for credits that aren't due to
 * expire.
 */
const PROMOTIONAL_TIME_BOUNDARY = Infinity;

type ClassNames = 'root' | 'cash' | 'text';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginBottom: theme.spacing(2),
      padding: theme.spacing(2),
      borderLeft: `32px solid ${theme.color.green}`
    },
    cash: {
      color: theme.color.white,
      position: 'absolute',
      left: 13,
      '& .icon': {
        marginTop: 20
      }
    },
    text: {
      paddingTop: theme.spacing(1)
    }
  });

interface Props {
  expiration: string;
}

export type CombinedProps = Props & WithStyles<ClassNames>;

export const expiresInDays = (time: string) => {
  return moment(time).diff(moment(), 'days');
};

export const PromotionsBanner: React.FC<CombinedProps> = props => {
  const { classes, expiration } = props;
  const days = expiresInDays(expiration);
  if (days >= PROMOTIONAL_TIME_BOUNDARY) {
    return null;
  }
  return (
    <Paper className={classes.root}>
      <div className={classes.cash}>
        <AttachMoney className={'icon'} />
      </div>
      <Typography variant="h2">
        You have promotional credits expiring in {days} days.
      </Typography>
      <Typography variant="body1" className={classes.text}>
        Charges will begin to accrue on {` `}
        <DateTimeDisplay value={expiration} format={'MMMM Do, YYYY'} />
        {` `}
        unless you cancel any related services.
      </Typography>
      <Link to="account/billing" className={classes.text}>
        See billing for details.
      </Link>
    </Paper>
  );
};

const styled = withStyles(styles);
const enhanced = compose<CombinedProps, Props>(
  styled,
  React.memo
);
export default enhanced(PromotionsBanner);
