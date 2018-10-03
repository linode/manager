import * as classNames from 'classnames';
import * as React from 'react';

import ListItemText from '@material-ui/core/ListItemText';
import MenuItem, { MenuItemProps } from '@material-ui/core/MenuItem';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

type ClassNames = 'root'
  | 'error'
  | 'warning'
  | 'success';

const styles: StyleRulesCallback<ClassNames> = (theme) => {
  const { palette: { status } } = theme;
  return {
    root: {
      paddingTop: 16,
      paddingBottom: 16,
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
      borderLeftColor: 'transparent',
      transition: theme.transitions.create(['background-color']),
      '&:hover': {
        backgroundColor: theme.bg.offWhite,
      },
    },
    error: {
      borderLeftColor: status.errorDark,
    },
    warning: {
      borderLeftColor: status.warningDark,
    },
    success: {
      borderLeftColor: status.successDark,
    },
  };
};

interface Props extends MenuItemProps {
  title: string;
  content?: string;
  onClick?: (e: React.SyntheticEvent<HTMLElement>) => void;
  success?: boolean;
  error?: boolean;
  warning?: boolean;
}

type FinalProps = Props & WithStyles<ClassNames>;

const EventListItem: React.StatelessComponent<FinalProps> = (props) => {
  const {
    classes,
    title,
    content,
    onClick,
    error,
    warning,
    success,
    ...rest
  } = props;

  return (
    <MenuItem
      className={classNames({
        [classes.root]: true,
        [classes.error]: error,
        [classes.warning]: warning,
        [classes.success]: success,
      })}
      role="menu"
      {...rest}
      {...((onClick) && { onClick, onKeyPress: onClick })}
      divider={true}
    >
      <ListItemText
        primary={title}
        secondary={content}
      />
    </MenuItem>
  );
};

export default withStyles(styles, { withTheme: true })(EventListItem);
