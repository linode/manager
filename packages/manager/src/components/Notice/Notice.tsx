import Close from '@material-ui/icons/Close';
import classNames from 'classnames';
import * as React from 'react';
import Error from 'src/assets/icons/alert.svg';
import Check from 'src/assets/icons/check.svg';
import Flag from 'src/assets/icons/flag.svg';
import Warning from 'src/assets/icons/warning.svg';
import {
  makeStyles,
  Theme,
  withTheme,
  WithTheme,
} from 'src/components/core/styles';
import Typography, { TypographyProps } from 'src/components/core/Typography';
import Grid, { GridProps } from 'src/components/Grid';

export const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  root: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 1,
    fontSize: '1rem',
    marginBottom: theme.spacing(2),
    maxWidth: '100%',
    padding: '4px 16px',
    paddingRight: 18,
    position: 'relative',
    '& + .notice': {
      marginTop: `${theme.spacing()}px !important`,
    },
    '& $important': {
      backgroundColor: theme.bg.bgPaper,
    },
    '& $error': {
      borderLeftColor: theme.color.red,
    },
  },
  important: {
    backgroundColor: theme.bg.bgPaper,
    padding: theme.spacing(2),
    paddingRight: 18,
    '& $noticeText': {
      fontFamily: theme.font.normal,
    },
  },
  icon: {
    color: 'white',
    position: 'absolute',
    left: -25, // This value must be static regardless of theme selection
  },
  closeIcon: {
    ...theme.applyLinkStyles,
    display: 'flex',
    color: theme.textColors.tableStatic,
    marginLeft: 20,
  },
  inner: {
    width: '100%',
    '& p': {
      fontSize: '1rem',
    },
  },
  breakWords: {
    '& $noticeText': {
      wordBreak: 'break-all',
    },
  },
  noticeText: {
    fontFamily: theme.font.bold,
    fontSize: '1rem',
    lineHeight: '20px',
  },
  error: {
    animation: '$fadeIn 225ms linear forwards',
    borderLeft: `5px solid ${theme.palette.status.errorDark}`,
    '&$important': {
      borderLeftWidth: 32,
    },
  },
  errorList: {
    borderLeft: `5px solid ${theme.palette.status.errorDark}`,
  },
  warning: {
    animation: '$fadeIn 225ms linear forwards',
    borderLeft: `5px solid ${theme.palette.status.warningDark}`,
    '&$important': {
      borderLeftWidth: 32,
    },
    '& $icon': {
      color: '#555',
    },
  },
  warningList: {
    borderLeft: `5px solid ${theme.palette.status.warningDark}`,
  },
  success: {
    animation: '$fadeIn 225ms linear forwards',
    borderLeft: `5px solid ${theme.palette.status.successDark}`,
    '&$important': {
      borderLeftWidth: 32,
    },
  },
  successList: {
    borderLeft: `5px solid ${theme.palette.status.successDark}`,
  },
  flag: {
    marginRight: theme.spacing(2),
  },
  informational: {
    animation: '$fadeIn 225ms linear forwards',
    borderLeft: `5px solid ${theme.palette.primary.main}`,
    '&$important': {
      borderLeftWidth: 32,
    },
  },
  informationalList: {
    borderLeft: `5px solid ${theme.palette.primary.main}`,
  },
}));

interface Props extends GridProps {
  text?: string;
  error?: boolean;
  errorGroup?: string;
  important?: boolean;
  warning?: boolean;
  success?: boolean;
  typeProps?: TypographyProps;
  className?: string;
  flag?: boolean;
  notificationList?: boolean;
  spacingTop?: 0 | 4 | 8 | 12 | 16 | 24;
  spacingBottom?: 0 | 4 | 8 | 12 | 16 | 20 | 24 | 32;
  spacingLeft?: number;
  breakWords?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  // Dismissible Props
  dismissible?: boolean;
  onClose?: () => void;
  informational?: boolean;
}

type CombinedProps = Props & WithTheme;

const Notice: React.FC<CombinedProps> = (props) => {
  const {
    className,
    important,
    text,
    dismissible,
    error,
    breakWords,
    errorGroup,
    warning,
    success,
    typeProps,
    children,
    flag,
    notificationList,
    onClick,
    onClose,
    spacingTop,
    spacingBottom,
    spacingLeft,
    informational,
  } = props;

  const classes = useStyles();

  const innerText = text ? (
    <Typography
      {...typeProps}
      onClick={onClick}
      className={`${classes.noticeText} noticeText`}
    >
      {text}
    </Typography>
  ) : null;

  /**
   * There are some cases where the message
   * can be either a string or JSX. In those
   * cases we should use props.children, but
   * we want to make sure the string is wrapped
   * in Typography and formatted as it would be
   * if it were passed as props.text.
   */
  const _children =
    typeof children === 'string' ? (
      <Typography className={`${classes.noticeText} noticeText`}>
        {children}
      </Typography>
    ) : (
      children
    );

  const errorScrollClassName = errorGroup
    ? `error-for-scroll-${errorGroup}`
    : `error-for-scroll`;

  const dataAttributes = !props.error
    ? {
        'data-qa-notice': true,
      }
    : {
        'data-qa-notice': true,
        'data-qa-error': true,
      };

  return (
    <Grid
      item
      className={classNames({
        [classes.root]: true,
        [classes.important]: important,
        [errorScrollClassName]: error,
        [classes.breakWords]: breakWords,
        [classes.error]: error && !notificationList,
        [classes.errorList]: error && notificationList,
        [classes.success]: success && !notificationList,
        [classes.successList]: success && notificationList,
        [classes.warning]: warning && !notificationList,
        [classes.warningList]: warning && notificationList,
        [classes.informational]: informational && !notificationList,
        [classes.informationalList]: informational && notificationList,
        notice: true,
        ...(className && { [className]: true }),
      })}
      style={{
        marginTop: spacingTop !== undefined ? spacingTop : 0,
        marginBottom: spacingBottom !== undefined ? spacingBottom : 24,
        marginLeft: spacingLeft !== undefined ? spacingLeft : 0,
      }}
      {...dataAttributes}
      role="alert"
    >
      {flag && (
        <Grid item>
          <Flag className={classes.flag} />
        </Grid>
      )}
      {important &&
        ((success && <Check className={classes.icon} data-qa-success-img />) ||
          (warning && (
            <Warning className={classes.icon} data-qa-warning-img />
          )) ||
          (error && <Error className={classes.icon} data-qa-error-img />))}
      <div className={classes.inner}>{innerText || _children}</div>
      {dismissible && (
        <Grid item className={classes.closeIcon}>
          <Close
            style={{
              cursor: 'pointer',
            }}
            onClick={onClose}
            data-testid="notice-dismiss"
          />
        </Grid>
      )}
    </Grid>
  );
};

export default withTheme(Notice);
