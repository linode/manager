import * as React from 'react';
import * as classNames from 'classnames';

import { ListItem, ListItemText } from 'material-ui/List';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';

type ClassNames = 'root'
  | 'error'
  | 'warning'
  | 'success';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
  },
  error: {
  },
  warning: {
  },
  success: {
  },
});

interface Props {
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
    ...rest,
  } = props;

  return (
    <ListItem
      className={classNames({
        [classes.root]: true,
        [classes.error]: error,
        [classes.warning]: warning,
        [classes.success]: success,
      })}
      role="menu"
      {...rest}
      {...((onClick) && { onClick, onKeyPress: onClick })}
    >
      <ListItemText
        primary={title}
        secondary={content}
      />
    </ListItem>
  );
};

export default withStyles(styles, { withTheme: true })(EventListItem);
