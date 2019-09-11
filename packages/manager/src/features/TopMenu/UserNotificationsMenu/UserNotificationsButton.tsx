import * as classNames from 'classnames';
import { NotificationSeverity } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import IconButton from 'src/components/core/IconButton';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames =
  | 'root'
  | 'icon'
  | 'hasNoNotifications'
  | 'isMinor'
  | 'isMajor'
  | 'isCritical'
  | 'smaller';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginRight: -theme.spacing(1),
      position: 'relative',
      [theme.breakpoints.up('lg')]: {
        marginLeft: theme.spacing(1)
      },
      '&.active $icon': {
        backgroundColor: theme.palette.text.primary
      }
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
      fontFamily: 'LatoWebBold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1.1,
      '&:hover': {
        backgroundColor: theme.palette.text.primary
      }
    },
    isCritical: {
      backgroundColor: theme.palette.status.errorDark
    },
    isMajor: {
      backgroundColor: theme.palette.status.warningDark
    },
    isMinor: {
      backgroundColor: theme.palette.primary.main
    },
    smaller: {
      fontSize: 15
    },
    hasNoNotifications: {}
  });

interface Props {
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  severity: null | NotificationSeverity;
  notifications: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const userNotificationButton: React.StatelessComponent<CombinedProps> = ({
  classes,
  onClick,
  className,
  severity,
  notifications
}) => {
  return (
    <IconButton
      onClick={onClick}
      className={`${classes.root} ${className}`}
      aria-label="User Notifications"
    >
      <div
        className={classNames({
          [classes.icon]: true,
          [classes.hasNoNotifications]: severity === null,
          [classes.isMinor]: severity === 'minor',
          [classes.isMajor]: severity === 'major',
          [classes.isCritical]: severity === 'critical',
          [classes.smaller]: notifications.length > 9
        })}
      >
        {notifications.length <= 9 ? notifications.length : '9+'}
      </div>
    </IconButton>
  );
};

const styled = withStyles(styles);

export default styled(userNotificationButton);
