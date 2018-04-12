import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import IconButton from 'material-ui/IconButton';
import NotificationIcon from '../../../assets/icons/bell.svg';
import LinodeTheme from '../../../theme';

type ClassNames = 'root' | 'icon' | 'new';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
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
    width: 10,
    height: 10,
    backgroundColor: LinodeTheme.color.red,
    borderRadius: '50%',
    position: 'absolute',
    zINdex: 2,
    bottom: 8,
    right: 8,
  },
});

interface Props {
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  getRef: (e: HTMLElement) => void;
  hasNew: boolean;
  disabled?: boolean;
  className?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserNotificationButton: React.StatelessComponent<CombinedProps> = ({
  classes,
  hasNew,
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
      {hasNew
        ? <span className={classes.new}/>
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
