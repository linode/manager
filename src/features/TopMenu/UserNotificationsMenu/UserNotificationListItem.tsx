import * as classNames from 'classnames';
import * as React from 'react';

import ListItem from '@material-ui/core/ListItem';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

type ClassNames =
  | 'critical'
  | 'flag'
  | 'inner'
  | 'innerLink'
  | 'innerTitle'
  | 'major'
  | 'minor'
  | 'noticeText'
  | 'pointer'
  | 'root';

const styles: StyleRulesCallback = (theme) => {
  const { palette: { status } } = theme;

  return {
    pointer: {
      cursor: 'pointer',
    },
    root: {
      margin: 0,
      justifyContent: 'center',
      padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
      borderBottom: `1px solid ${theme.palette.divider}`,
      transition: theme.transitions.create('background-color'),
      '& p': {
        color: '#32363C',
      },
      '& + .notice': {
        marginTop: '0 !important',
      },
      '&:hover, &:focus': {
        backgroundColor: theme.bg.main,
      },
      maxWidth: '100%',
      display: 'flex',
      alignItems: 'center',
      outline: 0,
    },
    inner: {
      width: '100%',
      display: 'block',
    },
    innerLink: {
      '& > h3': {
        lineHeight: '1.2',
        textDecoration: 'underline',
      },
    },
    innerTitle: {
      marginBottom: theme.spacing.unit / 2,
    },
    noticeText: {
      color: theme.palette.text.primary,
      fontWeight: 700,
    },
    critical: {
      borderLeft: `5px solid ${status.errorDark}`,
    },
    major: {
      borderLeft: `5px solid ${status.warningDark}`,
    },
    minor: {
      borderLeft: `5px solid ${status.successDark}`,
    },
    flag: {
      marginRight: theme.spacing.unit * 2,
    },
  };
};

interface Props {
  label: string;
  message: string;
  severity: Linode.NotificationSeverity;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const userNotificationListItem: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    label,
    message,
    severity,
    onClick,
  } = props;

  return (
    <ListItem
      className={classNames({
        [classes.root]: true,
        [classes[severity]]: true,
        [classes.pointer]: Boolean(onClick),
        notice: true,
      })}
      data-qa-notice
      component="li"
      tabIndex={1}
      onClick={onClick}
      button={Boolean(onClick)}
    >
      <div className={classNames(
        {
          [classes.inner]: true,
          [classes.innerLink]: Boolean(onClick),
        }
      )}>
        <Typography role="header" variant="subheading" className={classes.innerTitle}>{label}</Typography>
        <Typography variant="caption">{message}</Typography>
      </div>
    </ListItem>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(userNotificationListItem);
