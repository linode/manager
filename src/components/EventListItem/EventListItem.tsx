import { WithStyles } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import * as React from 'react';
import ListItemText from 'src/components/core/ListItemText';
import MenuItem, { MenuItemProps } from 'src/components/core/MenuItem';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';

type ClassNames = 'root' | 'error' | 'warning' | 'success';

const styles = (theme: Theme) => {
  const {
    palette: { status }
  } = theme;
  return createStyles({
    root: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      borderLeftWidth: 5,
      borderLeftStyle: 'solid',
      borderLeftColor: 'transparent',
      transition: theme.transitions.create(['background-color']),
      '&:hover': {
        backgroundColor: theme.bg.offWhite
      }
    },
    error: {
      borderLeftColor: status.errorDark
    },
    warning: {
      borderLeftColor: status.warningDark
    },
    success: {
      borderLeftColor: status.successDark
    }
  });
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

const EventListItem: React.StatelessComponent<FinalProps> = props => {
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
        [classes.success]: success
      })}
      role="menu"
      {...rest}
      {...onClick && { onClick, onKeyPress: onClick }}
      divider={true}
    >
      <ListItemText primary={title} secondary={content} />
    </MenuItem>
  );
};

export default withStyles(styles)(EventListItem);
