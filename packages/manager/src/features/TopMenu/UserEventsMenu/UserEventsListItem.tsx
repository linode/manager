import * as classNames from 'classnames';
import * as React from 'react';
import ListItem from 'src/components/core/ListItem';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';

type ClassNames =
  | 'root'
  | 'title'
  | 'content'
  | 'unread'
  | 'linkItem'
  | 'pointer'
  | 'noLink'
  | 'helperText';

const styles = (theme: Theme) => {
  const {
    palette: { status }
  } = theme;

  return createStyles({
    root: {
      ...theme.notificationList,
      padding: 0,
      borderBottom: `1px solid ${theme.palette.divider}`,
      display: 'block',
      transition: theme.transitions.create(['border-color', 'opacity']),
      outline: 0,
      '&:hover, &:focus': {
        backgroundColor: 'transparent'
      }
    },
    linkItem: {
      display: 'block',
      padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`
    },
    title: {
      marginBottom: theme.spacing(1) / 2
    },
    content: {
      ...theme.typography.body1
    },
    helperText: {
      ...theme.typography.body1,
      marginBottom: theme.spacing(1)
    },
    unread: {},
    warning: {
      borderLeftColor: status.warningDark
    },
    success: {
      borderLeftColor: status.successDark
    },
    pointer: {
      '&:hover, &:focus': {
        backgroundColor: theme.palette.primary.main,
        '& $title, & $content, & $helperText': {
          color: 'white'
        }
      },
      '& > h3': {
        lineHeight: '1.2'
      }
    },
    noLink: {
      '& $title': {
        opacity: 0.5
      }
    }
  });
};

export interface Props {
  title: string;
  content?: string;
  success?: boolean;
  warning?: boolean;
  error?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  className?: any;
  linkPath: string | undefined;
  helperText?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserEventsListItem extends React.Component<CombinedProps> {
  render() {
    const {
      classes,
      title,
      content,
      warning,
      success,
      error,
      onClick,
      linkPath,
      className,
      helperText
    } = this.props;

    const listItem = (
      <ListItem
        className={classNames(
          {
            [classes.root]: true,
            [classes.unread]: error || warning || success,
            [classes.pointer]: Boolean(onClick),
            [classes.noLink]: Boolean(!onClick)
          },
          className
        )}
        component="li"
        tabIndex={0}
        onClick={onClick}
        role="menuitem"
      >
        {onClick ? (
          <Link
            to={linkPath ? linkPath : '/'}
            onClick={onClick}
            className={classes.linkItem}
          >
            <Typography variant="h3" className={classes.title}>
              {title}
            </Typography>
            {helperText && (
              <Typography variant="body1" className={classes.helperText}>
                {helperText}
              </Typography>
            )}
            {content && <div className={classes.content}>{content}</div>}
          </Link>
        ) : (
          <div className={classes.linkItem}>
            <Typography variant="h3" className={classes.title}>
              {title}
            </Typography>
            {helperText && (
              <Typography variant="body1" className={classes.helperText}>
                {helperText}
              </Typography>
            )}
            {content && <div className={classes.content}>{content}</div>}
          </div>
        )}
      </ListItem>
    );

    return !Boolean(onClick)
      ? listItem
      : React.cloneElement(listItem, { button: true });
  }
}

const styled = withStyles(styles);

export default styled(UserEventsListItem);
