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
import { pluralize } from 'src/utilities/pluralize';
import { expiresInDays } from 'src/utilities/promoUtils';

/**
 * We may want to only display this component
 * for credits that will be expiring in the near
 * future; setting a threshold here will hide
 * the banner for credits that aren't due to
 * expire.
 */
const PROMOTIONAL_TIME_BOUNDARY = Infinity;

type ClassNames = 'root' | 'cash' | 'text' | 'link';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginBottom: theme.spacing(2),
      padding: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      borderLeft: `32px solid ${theme.color.green}`
    },
    cash: {
      color: theme.color.white,
      position: 'absolute',
      left: theme.spacing(1) + 5,
      '& .icon': {}
    },
    text: {
      padding: `${theme.spacing(2) - 2}px 0`
    },
    link: {
      fontSize: 14
    }
  });

interface Props {
  nearestExpiry?: string;
}

export type CombinedProps = Props & WithStyles<ClassNames>;

export const PromotionsBanner: React.FC<CombinedProps> = props => {
  const { classes, nearestExpiry } = props;

  if (!nearestExpiry) {
    return null;
  }

  const days = expiresInDays(nearestExpiry);
  if (!days || days >= PROMOTIONAL_TIME_BOUNDARY) {
    return null;
  }

  return (
    <Paper className={classes.root}>
      <div className={classes.cash}>
        <AttachMoney className={'icon'} />
      </div>
      <div>
        <Typography variant="h2">
          You have promotional credits expiring in{' '}
          {pluralize('day', 'days', days)}.
        </Typography>
        <Typography variant="body1" className={classes.text}>
          Charges will begin to accrue on {` `}
          <DateTimeDisplay value={nearestExpiry} format={'MMMM Do, YYYY'} />
          {` `}
          unless you cancel any related services.
        </Typography>
        <Link to="account/billing" className={classes.link}>
          See billing for details.
        </Link>
      </div>
    </Paper>
  );
};

const styled = withStyles(styles);
const enhanced = compose<CombinedProps, Props>(
  styled,
  React.memo
);
export default enhanced(PromotionsBanner);
