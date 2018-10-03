import * as classNames from 'classnames';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';

type ClassNames = 'root'
  | 'title'
  | 'content'
  | 'unread'
  | 'pointer';

const styles: StyleRulesCallback<ClassNames> = (theme) => {
  const { palette: { status } } = theme;

  return {
    root: {
      ...theme.notificationList,
      borderLeft: '5px solid transparent',
      padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
      borderBottom: `1px solid ${theme.palette.divider}`,
      display: 'block',
      transition: theme.transitions.create(['border-color', 'opacity']),
      outline: 0,
      '&:hover, &:focus': {
        backgroundColor: theme.bg.main,
      },
    },
    title: {
      marginBottom: theme.spacing.unit / 2,
    },
    content: {
      ...theme.typography.caption,
    },
    unread: {
      backgroundColor: theme.bg.main,
      opacity: 1,
    },
    warning: {
      borderLeftColor: status.warningDark,
    },
    success: {
      borderLeftColor: status.successDark,
    },
    pointer: {
      '& > h3': {
        lineHeight: '1.2',
        textDecoration: 'underline',
      },
    },
  };
};

export interface UserEventsListItemProps {
  title: string;
  content?: string;
  success?: boolean;
  warning?: boolean;
  error?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

type CombinedProps = UserEventsListItemProps & WithStyles<ClassNames>;

const userEventsListItem: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, title, content, warning, success, error, onClick } = props;
  return (
    <ListItem className={classNames({
        [classes.root]: true,
        [classes.unread]: error || warning || success,
        [classes.pointer]: Boolean(onClick),
      })}
      component="li"
      tabIndex={1}
      onClick={onClick}
      button={Boolean(onClick)}
    >
      <Typography role="header" variant="subheading" className={classes.title}>{title}</Typography>
      {content && <div className={classes.content}>{content}</div>}
    </ListItem>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<UserEventsListItemProps>(userEventsListItem);
