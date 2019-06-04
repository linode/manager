import { WithStyles } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import * as React from 'react';
import ListItem from 'src/components/core/ListItem';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
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
  const {
    palette: { status }
  } = theme;

  return createStyles({
    pointer: {
      cursor: 'pointer'
    },
    root: {
      margin: 0,
      justifyContent: 'center',
      padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
      borderBottom: `1px solid ${theme.palette.divider}`,
      transition: theme.transitions.create('background-color'),
      '& p': {
        color: theme.color.headline
      },
      '& + .notice': {
        marginTop: '0 !important'
      },
      '&:hover, &:focus': {
        backgroundColor: theme.palette.primary.main,
        '& $noticeText, & p, & $innerTitle': {
          color: 'white'
        }
      },
      maxWidth: '100%',
      display: 'flex',
      alignItems: 'center',
      outline: 0
    },
    inner: {
      width: '100%',
      display: 'block'
    },
    innerLink: {
      '& > h3': {
        lineHeight: '1.2'
      }
    },
    innerTitle: {
      marginBottom: theme.spacing(1) / 2
    },
    noticeText: {
      color: theme.palette.text.primary,
      fontFamily: theme.font.bold
    },
    critical: {
      borderLeft: `5px solid ${status.errorDark}`
    },
    major: {
      borderLeft: `5px solid ${status.warningDark}`
    },
    minor: {
      borderLeft: `5px solid ${status.successDark}`
    },
    flag: {
      marginRight: theme.spacing(2)
    }
  });
};

interface Props {
  label: string;
  message: string;
  severity: Linode.NotificationSeverity;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const userNotificationListItem: React.StatelessComponent<
  CombinedProps
> = props => {
  const { classes, label, message, severity, onClick } = props;

  return (
    <ListItem
      className={classNames({
        [classes.root]: true,
        [classes[severity]]: true,
        [classes.pointer]: Boolean(onClick),
        notice: true
      })}
      data-qa-notice
      component="li"
      tabIndex={1}
      onClick={onClick}
      button={Boolean(onClick)}
    >
      <div
        className={classNames({
          [classes.inner]: true,
          [classes.innerLink]: Boolean(onClick)
        })}
      >
        <Typography variant="h3" className={classes.innerTitle}>
          {label}
        </Typography>
        <Typography variant="body1">{message}</Typography>
      </div>
    </ListItem>
  );
};

const styled = withStyles(styles);

export default styled(userNotificationListItem);
