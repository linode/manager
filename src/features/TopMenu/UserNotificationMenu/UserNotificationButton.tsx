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
    marginLeft: theme.spacing.unit * 2,
    marginRight: - theme.spacing.unit,
    position: 'relative',
    '&:hover, &:focus': {
      '& $icon': {
        fill: theme.palette.primary.main,
      },
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
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserNotificationButton: React.StatelessComponent<CombinedProps> = ({
  classes,
  hasNew,
  onClick,
  getRef,
}) => {

  return (
    <IconButton
      onClick={onClick}
      buttonRef={getRef}
      className={classes.root}
    >
      <NotificationIcon className={classes.icon} />
      {hasNew
        ? <span className={classes.new}/>
        : ''
      }
    </IconButton>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(UserNotificationButton);
