import * as classNames from 'classnames';
import * as React from 'react';
import ListItem from 'src/components/core/ListItem';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames = 'root' | 'title' | 'content' | 'unread' | 'pointer';

const styles: StyleRulesCallback<ClassNames> = theme => {
  const {
    palette: { status }
  } = theme;

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
        backgroundColor: theme.palette.primary.main,
        '& $title, & $content': {
          color: 'white'
        }
      }
    },
    title: {
      marginBottom: theme.spacing.unit / 2
    },
    content: {
      ...theme.typography.body1
    },
    unread: {
      backgroundColor: theme.bg.main,
      opacity: 1
    },
    warning: {
      borderLeftColor: status.warningDark
    },
    success: {
      borderLeftColor: status.successDark
    },
    pointer: {
      '& > h3': {
        lineHeight: '1.2'
      }
    }
  };
};

export interface Props {
  title: string;
  content?: string;
  success?: boolean;
  warning?: boolean;
  error?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  className?: any;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const userEventsListItem: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    title,
    content,
    warning,
    success,
    error,
    onClick,
    className
  } = props;
  return (
    <ListItem
      className={classNames(
        {
          [classes.root]: true,
          [classes.unread]: error || warning || success,
          [classes.pointer]: Boolean(onClick)
        },
        className
      )}
      component="li"
      tabIndex={1}
      onClick={onClick}
      button={Boolean(onClick)}
    >
      <Typography variant="h3" className={classes.title}>
        {title}
      </Typography>
      {content && <div className={classes.content}>{content}</div>}
    </ListItem>
  );
};

const styled = withStyles(styles);

export default styled(userEventsListItem);
