import * as classNames from 'classnames';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Grid, { GridProps } from 'src/components/Grid';

type ClassNames =
  | 'critical'
  | 'flag'
  | 'inner'
  | 'major'
  | 'minor'
  | 'noticeText'
  | 'pointer'
  | 'root';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => {
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
      '& p': {
        color: '#333',
      },
      '& + .notice': {
        marginTop: '0 !important',
      },
      // marginBottom: the1`me.spacing.unit,
      maxWidth: '100%',
      display: 'flex',
      alignItems: 'center',
    },
    inner: {
      width: '100%',
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

interface Props extends GridProps {
  label: string;
  message: string;
  severity: Linode.NotificationSeverity;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserNotificationListItem: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    label,
    message,
    severity,
    onClick,
  } = props;

  return (
    <Grid
      item
      className={classNames({
        [classes.root]: true,
        [classes[severity]]: true,
        [classes.pointer]: Boolean(onClick),
        notice: true,
      })}
      data-qa-notice
    >
      <div className={classes.inner} onClick={onClick}>
        <Typography>{label}</Typography>
        <Typography variant="caption">{message}</Typography>
      </div>
    </Grid>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(UserNotificationListItem);
