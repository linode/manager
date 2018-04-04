import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';


type ClassNames = 'root' | 'title' | 'content';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {},
  content: {},
});

export interface UserNotificationListItemProps {
  title: string;
  content?: string;
}

type CombinedProps = UserNotificationListItemProps & WithStyles<ClassNames>;

const UserNotificationListItem: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, title, content } = props;
  return (
  <div className={classes.root}>
    <div className={classes.title}>{title}</div>
    { content && <div className={classes.content}>{content}</div> }
  </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<UserNotificationListItemProps>(UserNotificationListItem);
