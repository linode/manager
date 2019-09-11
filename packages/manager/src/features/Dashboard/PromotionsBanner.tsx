import { Notification } from 'linode-js-sdk/lib/account';
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
  notifications: Notification[];
}

export type CombinedProps = Props & WithStyles<ClassNames>;

export const PromotionsBanner: React.FC<CombinedProps> = props => {
  const { classes, notifications } = props;

  if (notifications.length === 0) {
    return null;
  }

  // For now we only will have one promotion active at a time.
  const thisNotification = notifications[0];

  return (
    <Paper className={classes.root}>
      <div className={classes.cash}>
        <AttachMoney className={'icon'} />
      </div>
      <div>
        <Typography variant="h2">{thisNotification.label}</Typography>
        <Typography variant="body1" className={classes.text}>
          {thisNotification.message}
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
