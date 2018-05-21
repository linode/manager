import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import IconButton from 'material-ui/IconButton';
import Alert from 'material-ui-icons/Error';

type ClassNames = 'root'
| 'icon'
| 'isImportant';

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
      '& $isImportant': {
        fill: theme.color.red,
      },
    },
  },
  icon: {
    width: 32,
    height: 32,
    transition: theme.transitions.create['fill'],
    fill: '#aaa',
  },
  isImportant: {
    fill: theme.color.red,
  },
});

interface Props {
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  isImportant?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserNotificationButton: React.StatelessComponent<CombinedProps> = ({
  classes,
  isImportant,
  onClick,
  className,
}) => {

  return (
    <IconButton
      onClick={onClick}
      className={`${classes.root} ${className}`}
    >
      <Alert className={`
        ${classes.icon}
        ${isImportant ? classes.isImportant : ''}
      `} />
    </IconButton>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(UserNotificationButton);
