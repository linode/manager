import * as classNames from 'classnames';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography, { TypographyProps } from '@material-ui/core/Typography';

import Flag from 'src/assets/icons/flag.svg';
import Grid, { GridProps } from 'src/components/Grid';

type ClassNames = 'root'
  | 'inner'
  | 'noticeText'
  | 'error'
  | 'errorList'
  | 'warning'
  | 'warningList'
  | 'success'
  | 'successList'
  | 'flag';

const styles: StyleRulesCallback = (theme: Theme & Linode.Theme) => {
  const { palette: { status } } = theme;

  return {
    root: {
      marginBottom: theme.spacing.unit * 2,
      padding: '4px 16px',
      maxWidth: '100%',
      display: 'flex',
      alignItems: 'center',
      '& p': {
        wordWrap: 'break-word',
      },
      '& + .notice': {
        marginTop: `${theme.spacing.unit}px !important`,
      },
    },
    inner: {
      width: '100%',
    },
    noticeText: {
      color: theme.palette.text.primary,
      fontWeight: 700,
      lineHeight: 1.2,
    },
    error: {
      borderLeft: `5px solid ${status.errorDark}`,
      '& $noticeText': {
        color: status.errorDark,
      },
    },
    errorList: {
      borderLeft: `5px solid ${status.errorDark}`,
    },
    warning: {
      borderLeft: `5px solid ${status.warningDark}`,
      '& $noticeText': {
        color: status.warningDark,
      },
    },
    warningList: {
      borderLeft: `5px solid ${status.warningDark}`,
    },
    success: {
      borderLeft: `5px solid ${status.successDark}`,
      '& $noticeText': {
        color: status.successDark,
      },
    },
    successList: {
      borderLeft: `5px solid ${status.successDark}`,
    },
    flag: {
      marginRight: theme.spacing.unit * 2,
    },
  };
};

interface Props extends GridProps {
  text?: string;
  html?: string;
  error?: boolean;
  errorGroup?: string;
  warning?: boolean;
  success?: boolean;
  typeProps?: TypographyProps;
  className?: string;
  flag?: boolean;
  notificationList?: boolean;
  spacingTop?: 8 | 16 | 24;
  spacingBottom?: 8 | 16 | 24;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const Notice: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    className,
    text,
    error,
    errorGroup,
    warning,
    success,
    typeProps,
    children,
    flag,
    html,
    notificationList,
    onClick,
  } = props;

  const c = html
    ? (
      <Typography {...typeProps} dangerouslySetInnerHTML={{ __html: html }} />
    )
    : (
      <Typography {...typeProps} component="div" onClick={onClick} className={classes.noticeText}>
        {text && text}
        {children && children}
      </Typography>
    );

  const errorScrollClassName = errorGroup ? `error-for-scroll-${errorGroup}` : `error-for-scroll`;

  return (
    <Grid
      item
      className={classNames({
        [classes.root]: true,
        [errorScrollClassName]: error,
        [classes.error]: error && !notificationList,
        [classes.errorList]: error && notificationList,
        [classes.success]: success && !notificationList,
        [classes.successList]: success && notificationList,
        [classes.warning]: warning && !notificationList,
        [classes.warningList]: warning && notificationList,
        notice: true,
        ...(className && { [className]: true }),
      })}
      style={{ marginTop: 0 || props.spacingTop, marginBottom: 24 || props.spacingBottom }}
      data-qa-notice
    >
      {
        flag &&
        <Grid item>
          <Flag className={classes.flag} />
        </Grid>
      }
      <div className={classes.inner}>
        {c}
      </div>
    </Grid>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(Notice);
