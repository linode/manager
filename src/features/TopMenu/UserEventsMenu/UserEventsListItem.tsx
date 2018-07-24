import * as classNames from 'classnames';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

type ClassNames = 'root'
  | 'title'
  | 'content'
  | 'unread'
  | 'pointer';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => {
  const { palette: { status } } = theme;

  return {
    root: {
      ...theme.notificationList,
      borderLeft: '5px solid transparent',
      padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
      borderBottom: `1px solid ${theme.palette.divider}`,
      opacity: .7,
      transition: theme.transitions.create(['border-color', 'opacity']),
      '&:hover': {
        backgroundColor: 'white',
      },
    },
    title: {
      ...theme.typography.subheading,
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
      cursor: 'pointer',
      border: 'none',
      outline: 0,
      '&:hover, &:focus': {
        backgroundColor: theme.bg.main,
        opacity: 1,
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
    <div className={classNames({
      [classes.root]: true,
      [classes.unread]: error || warning || success,
      [classes.pointer]: Boolean(onClick),
    })}
      onClick={onClick}
      tabIndex={1}
    >
      <div className={classes.title}>{title}</div>
      {content && <div className={classes.content}>{content}</div>}
    </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<UserEventsListItemProps>(userEventsListItem);
