import * as React from 'react';

import { StyleRulesCallback, Theme,withStyles, WithStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';

import NotificationIcon from '../../../assets/icons/bell.svg';

type ClassNames = 'root'
  | 'icon'
  | 'new'
  | 'count';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  root: {
    marginRight: - theme.spacing.unit,
    position: 'relative',
    opacity: 1,
    transition: theme.transitions.create(['opacity']),
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing.unit * 2,
    },
    '&:hover, &.active': {
      '& $icon': {
        fill: theme.palette.primary.main,
      },
    },
    '&[disabled]': {
      opacity: .3,
    },
  },
  icon: {
    transition: theme.transitions.create['fill'],
    fill: '#999',
  },
  new: {
    animation: 'fadeIn 225ms ease-in-out',
    padding: '0 5px',
    height: 17,
    backgroundColor: theme.color.red,
    borderRadius: 10,
    position: 'absolute',
    zIndex: 2,
    top: 0,
    right: 2,
    display: 'flex',
    alignItems: 'center',
  },
  count: {
    color: 'white',
    fontWeight: 700,
    display: 'block',
    fontSize: '.7rem',
    lineHeight: 0,
    position: 'relative',
    top: -1,
  },
});

interface Props {
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  getRef: (e: HTMLElement) => void;
  notificationCount?: number;
  disabled?: boolean;
  className?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserNotificationButton: React.StatelessComponent<CombinedProps> = ({
  classes,
  notificationCount,
  onClick,
  getRef,
  disabled,
  className,
}) => {

  return (
    <IconButton
      onClick={onClick}
      buttonRef={getRef}
      className={`${classes.root} ${className}`}
      disabled={disabled}
    >
      <NotificationIcon className={classes.icon} />
      {(notificationCount as number > 0)
        ? <div className={classes.new}>
            <span className={classes.count}>{notificationCount}</span>
          </div>
        : ''
      }
    </IconButton>
  );
};

UserNotificationButton.defaultProps = {
  disabled: false,
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(UserNotificationButton);
