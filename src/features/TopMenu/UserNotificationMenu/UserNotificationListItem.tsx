import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';


type ClassNames = 'root' | 'title' | 'content';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: `${theme.spacing.unit * 2}px
    ${theme.spacing.unit * 4}px
    ${theme.spacing.unit * 2}px
    ${theme.spacing.unit * 3 - 1}px`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderLeft: `5px solid ${theme.palette.primary.main}`,
  },
  title: {
    ...theme.typography.subheading,
  },
  content: {
    ...theme.typography.caption,
  },
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
