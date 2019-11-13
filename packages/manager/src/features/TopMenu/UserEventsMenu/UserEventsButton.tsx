import * as React from 'react';
import NotificationIcon from 'src/assets/icons/bell.svg';
import IconButton from 'src/components/core/IconButton';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

type ClassNames = 'root' | 'icon' | 'new' | 'count';

const styles = (theme: Theme) =>
  createStyles({
    '@keyframes fadeIn': {
      from: {
        opacity: 0
      },
      to: {
        opacity: 1
      }
    },
    root: {
      order: 6,
      marginLeft: theme.spacing(1) / 2,
      marginRight: theme.spacing(1),
      position: 'relative',
      opacity: 1,
      transition: theme.transitions.create(['opacity']),
      [theme.breakpoints.up('md')]: {
        marginRight: 0
      },
      [theme.breakpoints.up('lg')]: {
        marginLeft: theme.spacing(1),
        marginRight: -theme.spacing(2)
      },
      '&:hover': {
        '& $icon': {
          fill: theme.palette.primary.main
        }
      },
      '&.active': {
        '& $icon': {
          fill: theme.palette.primary.dark
        }
      },
      '&[disabled]': {
        opacity: 0.3
      }
    },
    icon: {
      transition: theme.transitions.create(['fill']),
      fill: '#999'
    },
    new: {
      animation: '$fadeIn 225ms ease-in-out',
      padding: '0 5px',
      height: 17,
      backgroundColor: theme.color.red,
      borderRadius: 10,
      position: 'absolute',
      zIndex: 2,
      top: 0,
      right: 2,
      display: 'flex',
      alignItems: 'center'
    },
    count: {
      color: 'white',
      fontFamily: 'LatoWebBold', // we keep this bold at all times
      display: 'block',
      fontSize: '.7rem',
      lineHeight: 0,
      position: 'relative',
      top: -1
    }
  });

interface Props {
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  count?: number;
  disabled?: boolean;
  className?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserEventsButton: React.StatelessComponent<CombinedProps> = ({
  classes,
  count,
  onClick,
  disabled,
  className
}) => {
  return (
    <IconButton
      onClick={onClick}
      className={`${classes.root} ${className}`}
      disabled={disabled}
      aria-label="User Events"
      aria-owns={open ? 'menu-list-grow' : undefined}
      aria-haspopup="true"
      data-testid="ueb"
    >
      <NotificationIcon className={classes.icon} />
      {count && count > 0 ? (
        <div className={classes.new}>
          <span className={classes.count}>{count}</span>
        </div>
      ) : (
        ''
      )}
    </IconButton>
  );
};

UserEventsButton.defaultProps = {
  disabled: false
};

const styled = withStyles(styles);

export default styled(UserEventsButton);
