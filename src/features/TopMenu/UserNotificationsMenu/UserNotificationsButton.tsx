import * as classNames from 'classnames';
import * as React from 'react';

import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Alert from 'src/assets/icons/alerts.svg';

type ClassNames = 'root'
  | 'icon'
  | 'hasNoNotifications'
  | 'isMinor'
  | 'isMajor'
  | 'isCritical'
  | 'allRead';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    marginRight: - theme.spacing.unit,
    position: 'relative',
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing.unit * 2,
    },
    '&:hover, &.active': {
      '& $icon': {
        fill: theme.palette.primary.light,
      },
    },
  },
  icon: {
    position: 'relative',
    top: 1,
    width: 28,
    height: 28,
    transition: theme.transitions.create(['color', 'opacity']),
    color: theme.palette.primary.main,
    '& .circle': {
      fill: 'currentColor',
    },
    '& .line, & .dot': {
      fill: '#fff',
      stroke: '#fff',
    },
    '& .line': {
      strokeWidth: 4,
    },
    '& .dot': {
      strokeWidth: 3,
    },
  },
  isCritical: {
    color: 'red',
  },
  isMajor: {
    color: 'yellow',
  },
  isMinor: {
    color: 'blue',
  },
  hasNoNotifications: {
    color: 'darkgray',
  },
  allRead: {
    '& .circle': {
      fill: 'none',
      stroke: theme.palette.text.primary,
    },
    '& .dot, & .line': {
      fill: theme.palette.text.primary,
      stroke: theme.palette.text.primary,
    },
  },
});

interface Props {
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  severity: null | Linode.NotificationSeverity;
  allRead?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserNotificationButton: React.StatelessComponent<CombinedProps> = ({
  classes,
  allRead,
  onClick,
  className,
  severity
}) => {
  return (
    <IconButton
      onClick={onClick}
      className={`${classes.root} ${className}`}
    >
      <Alert className={
        classNames({
          [classes.icon]: true,
          [classes.allRead]: allRead,
          [classes.hasNoNotifications]: severity === null,
          [classes.isMinor]: severity === 'minor',
          [classes.isMajor]: severity === 'major',
          [classes.isCritical]: severity === 'critical',
        })} />
    </IconButton>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(UserNotificationButton);
