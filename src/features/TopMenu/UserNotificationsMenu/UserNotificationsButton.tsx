import * as classNames from 'classnames';
import * as React from 'react';

import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

type ClassNames = 'root'
  | 'icon'
  | 'hasNoNotifications'
  | 'isMinor'
  | 'isMajor'
  | 'isCritical'
  | 'smaller';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    marginRight: - theme.spacing.unit,
    position: 'relative',
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing.unit * 2,
    },
    '&.active $icon': {
      backgroundColor: theme.palette.text.primary,
    },
  },
  icon: {
    position: 'relative',
    top: 0,
    width: 28,
    height: 28,
    transition: theme.transitions.create(['background-color']),
    color: theme.color.white,
    borderRadius: '50%',
    backgroundColor: theme.color.grey3,
    fontSize: 17,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: theme.palette.text.primary,
    },
  },
  isCritical: {
    backgroundColor: theme.palette.status.errorDark,
  },
  isMajor: {
    backgroundColor: theme.palette.status.warningDark,
  },
  isMinor: {
    backgroundColor: theme.palette.primary.main,
  },
  smaller: {
    fontSize: 15,
  },
  hasNoNotifications: {
  },
});

interface Props {
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  severity: null | Linode.NotificationSeverity;
  notifications: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const userNotificationButton: React.StatelessComponent<CombinedProps> = ({
  classes,
  onClick,
  className,
  severity,
  notifications,
}) => {
  return (
    <IconButton
      onClick={onClick}
      className={`${classes.root} ${className}`}
    >
      <div className={
        classNames({
          [classes.icon]: true,
          [classes.hasNoNotifications]: severity === null,
          [classes.isMinor]: severity === 'minor',
          [classes.isMajor]: severity === 'major',
          [classes.isCritical]: severity === 'critical',
          [classes.smaller]: notifications.length > 9,
        })}>
        {notifications.length <= 9 ? notifications.length : '9+'}
      </div>
    </IconButton>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(userNotificationButton);
