import * as React from 'react';
import * as classNames from 'classnames';

import {
  withStyles,
  StyleRulesCallback,
  WithStyles,
} from 'material-ui';


type ClassNames = 'root'
  | 'title'
  | 'content'
  | 'warning'
  | 'success'
  | 'error';


const styles: StyleRulesCallback<ClassNames> = (theme: Linode.Theme) => {
  const { palette: { status } } = theme;

  return {
    root: {
      ...theme.notificationList,
      borderLeft: '5px solid transparent',
    },
    title: {
      ...theme.typography.subheading,
    },
    content: {
      ...theme.typography.caption,
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

export interface UserNotificationListItemProps {
  title: string;
  content?: string;
  success?: boolean;
  warning?: boolean;
  error?: boolean;
}

type CombinedProps = UserNotificationListItemProps & WithStyles<ClassNames>;

const UserNotificationListItem: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, title, content, warning, success, error } = props;
  return (
  <div className={classNames({
    [classes.root]: true,
    [classes.error]: error,
    [classes.warning]: warning,
    [classes.success]: success,
  })}>
    <div className={classes.title}>{title}</div>
    { content && <div className={classes.content}>{content}</div> }
  </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<UserNotificationListItemProps>(UserNotificationListItem);
