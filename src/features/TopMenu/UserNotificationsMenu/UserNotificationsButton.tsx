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
  },
  icon: {
    position: 'relative',
    top: 1,
    width: 28,
    height: 28,
    transition: theme.transitions.create(['color', 'opacity']),
    color: theme.palette.primary.main,
    '& .circle': {
      transition: theme.transitions.create(['fill', 'stroke']),
      fill: 'currentColor',
      strokeWidth: 2,
      stroke: 'currentColor',
    },
    '& .line, & .dot': {
      transition: theme.transitions.create(['fill', 'stroke']),
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
    color: theme.palette.status.errorDark,
    '&:hover, &.active': {
      color: 'white',
      '& .circle': {
        stroke: theme.palette.status.errorDark,
      },
      '& .line, & .dot': {
        fill: theme.palette.status.errorDark,
        stroke: theme.palette.status.errorDark,
      },
    },
  },
  isMajor: {
    color: theme.palette.status.warningDark,
    '&:hover, &.active': {
      color: 'white',
      '& .circle': {
        stroke: theme.palette.status.warningDark,
      },
      '& .line, & .dot': {
        fill: theme.palette.status.warningDark,
        stroke: theme.palette.status.warningDark,
      },
    },
  },
  isMinor: {
    color: theme.palette.primary.main,
    '&:hover, &.active': {
      color: 'white',
      '& .circle': {
        stroke: theme.palette.primary.main,
      },
      '& .line, & .dot': {
        fill: theme.palette.primary.main,
        stroke: theme.palette.primary.main,
      },
    },
  },
  hasNoNotifications: {
    color: theme.color.grey3,
    '&:hover, &.active': {
      color: 'white',
      '& .circle': {
        stroke: theme.color.grey3,
      },
      '& .line, & .dot': {
        fill: theme.color.grey3,
        stroke: theme.color.grey3,
      },
    },
  },
  allRead: {
    opacity: .5,
  },
});

interface Props {
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  severity: null | Linode.NotificationSeverity;
  allRead?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const userNotificationButton: React.StatelessComponent<CombinedProps> = ({
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

export default styled<Props>(userNotificationButton);
