import classNames from 'classnames';
import { NotificationSeverity } from '@linode/api-v4/lib/account';
import * as React from 'react';
import ListItem from 'src/components/core/ListItem';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';

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

const styles = (theme: Theme) => {
  return createStyles({
    pointer: {
      cursor: 'pointer',
    },
    root: {
      margin: 0,
      justifyContent: 'center',
      padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
      borderBottom: `1px solid ${theme.palette.divider}`,
      transition: theme.transitions.create('background-color'),
      '& p': {
        color: theme.color.headline,
      },
      '& + .notice': {
        marginTop: '0 !important',
      },
      '&:hover, &:focus': {
        backgroundColor: theme.palette.primary.main,
        '& $noticeText, & p, & $innerTitle': {
          color: 'white',
        },
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
      },
    },
    innerTitle: {
      marginBottom: theme.spacing(0.5),
    },
    noticeText: {
      color: theme.palette.text.primary,
      fontFamily: theme.font.bold,
    },
    critical: {
      borderLeft: `5px solid ${theme.palette.error.dark}`,
    },
    major: {
      borderLeft: `5px solid ${theme.palette.warning.dark}`,
    },
    minor: {
      borderLeft: `5px solid ${theme.palette.success.dark}`,
    },
    flag: {
      marginRight: theme.spacing(2),
    },
  });
};

interface Props {
  label: string;
  message: string;
  severity: NotificationSeverity;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserNotificationListItem extends React.Component<CombinedProps> {
  render() {
    const { classes, label, message, severity, onClick } = this.props;

    const listItem = (
      <ListItem
        className={classNames({
          [classes.root]: true,
          [classes[severity]]: true,
          [classes.pointer]: Boolean(onClick),
          notice: true,
        })}
        data-qa-notice
        component="li"
        tabIndex={0}
        onClick={onClick}
      >
        <div
          className={classNames({
            [classes.inner]: true,
            [classes.innerLink]: Boolean(onClick),
          })}
        >
          <Typography variant="h3" className={classes.innerTitle}>
            {label}
          </Typography>
          <Typography variant="body1">{message}</Typography>
        </div>
      </ListItem>
    );

    return !Boolean(onClick)
      ? listItem
      : React.cloneElement(listItem, { button: true });
  }
}

const styled = withStyles(styles);

export default styled(UserNotificationListItem);
