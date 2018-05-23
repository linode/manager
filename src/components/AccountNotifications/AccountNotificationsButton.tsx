import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import IconButton from 'material-ui/IconButton';
import Alert from 'src/assets/icons/alerts.svg';

type ClassNames = 'root'
| 'icon'
| 'isImportant'
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
      '& $isImportant': {
        fill: theme.palette.status.errorDark,
        opacity: .7,
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
    '& .line': {
    },
    '& .line, & .dot': {
      fill: '#fff',
      stroke: '#fff',
      strokeWidth: 2,
    },
  },
  isImportant: {
    color: theme.palette.status.errorDark,
  },
  allRead: {
    '& .circle': {
      fill: 'none',
      stroke: theme.color.grey3,
    },
    '& .dot, & .line': {
      fill: theme.color.grey3,
      stroke: theme.color.grey3,
    },
  },
});

interface Props {
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  isImportant?: boolean;
  allRead?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserNotificationButton: React.StatelessComponent<CombinedProps> = ({
  classes,
  isImportant,
  allRead,
  onClick,
  className,
}) => {

  return (
    <IconButton
      onClick={onClick}
      className={`${classes.root} ${className}`}
      disabled={allRead}
    >
      <Alert className={`
        ${classes.icon}
        ${isImportant ? classes.isImportant : ''}
        ${allRead ? classes.allRead : ''}
      `} />
    </IconButton>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(UserNotificationButton);
