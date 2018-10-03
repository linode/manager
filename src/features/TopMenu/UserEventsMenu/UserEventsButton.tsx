import * as React from 'react';

import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import NotificationIcon from 'src/assets/icons/bell.svg';

type ClassNames = 'root'
  | 'icon'
  | 'new'
  | 'count';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  root: {
    marginRight: 6,
    position: 'relative',
    opacity: 1,
    transition: theme.transitions.create(['opacity']),
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing.unit * 2,
    },
    '&:hover': {
      '& $icon': {
        fill: theme.palette.primary.main,
      },
    },
    '&.active': {
      '& $icon': {
        fill: theme.palette.primary.dark,
      },
    },
    '&[disabled]': {
      opacity: .3,
    },
  },
  icon: {
    transition: theme.transitions.create(['fill']),
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
  count?: number;
  disabled?: boolean;
  className?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserEventsButton: React.StatelessComponent<CombinedProps> = ({
  classes,
  count,
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
      {count && count > 0
        ? <div className={classes.new}>
            <span className={classes.count}>{count}</span>
          </div>
        : ''
      }
    </IconButton>
  );
};

UserEventsButton.defaultProps = {
  disabled: false,
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(UserEventsButton);
