import Grid, { Grid2Props } from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import * as React from 'react';
import Error from 'src/assets/icons/alert.svg';
import Check from 'src/assets/icons/check.svg';
import Flag from 'src/assets/icons/flag.svg';
import Warning from 'src/assets/icons/warning.svg';
import Typography, { TypographyProps } from 'src/components/core/Typography';
import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles<
  void,
  'important' | 'error' | 'noticeText' | 'icon'
>()((theme: Theme, _params, classes) => ({
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
      marginTop: `${theme.spacing()} !important`,
    },
    [`& .${classes.important}`]: {
      backgroundColor: theme.bg.bgPaper,
    },
    [`& .${classes.error}`]: {
      borderLeftColor: theme.color.red,
    },
  },
  important: {
    backgroundColor: theme.bg.bgPaper,
    padding: theme.spacing(2),
    paddingRight: 18,
    [`& .${classes.noticeText}`]: {
      fontFamily: theme.font.normal,
    },
  },
  icon: {
    color: 'white',
    position: 'absolute',
    left: -25, // This value must be static regardless of theme selection
  },
  inner: {
    width: '100%',
  },
  breakWords: {
    [`& .${classes.noticeText}`]: {
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
    borderLeft: `5px solid ${theme.palette.error.dark}`,
    [`&.${classes.important}`]: {
      borderLeftWidth: 32,
    },
  },
  errorList: {
    borderLeft: `5px solid ${theme.palette.error.dark}`,
  },
  warning: {
    animation: '$fadeIn 225ms linear forwards',
    borderLeft: `5px solid ${theme.palette.warning.dark}`,
    [`&.${classes.important}`]: {
      borderLeftWidth: 32,
    },
    [`& .${classes.icon}`]: {
      color: '#555',
    },
  },
  warningList: {
    borderLeft: `5px solid ${theme.palette.warning.dark}`,
  },
  success: {
    animation: '$fadeIn 225ms linear forwards',
    borderLeft: `5px solid ${theme.palette.success.dark}`,
    [`&.${classes.important}`]: {
      borderLeftWidth: 32,
    },
  },
  successList: {
    borderLeft: `5px solid ${theme.palette.success.dark}`,
  },
  marketing: {
    borderLeft: `5px solid ${theme.color.green}`,
  },
  flag: {
    marginRight: theme.spacing(2),
  },
}));

export interface NoticeProps extends Grid2Props {
  text?: string;
  error?: boolean;
  errorGroup?: string;
  important?: boolean;
  warning?: boolean;
  success?: boolean;
  marketing?: boolean;
  typeProps?: TypographyProps;
  className?: string;
  flag?: boolean;
  notificationList?: boolean;
  spacingTop?: 0 | 4 | 8 | 12 | 16 | 24 | 32;
  spacingBottom?: 0 | 4 | 8 | 12 | 16 | 20 | 24 | 32;
  spacingLeft?: number;
  sx?: SxProps;
  breakWords?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const Notice = (props: NoticeProps) => {
  const {
    className,
    important,
    text,
    error,
    breakWords,
    errorGroup,
    warning,
    success,
    marketing,
    typeProps,
    children,
    flag,
    notificationList,
    onClick,
    spacingTop,
    spacingBottom,
    spacingLeft,
    sx,
  } = props;

  const { classes, cx } = useStyles();

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
      className={cx({
        [classes.root]: true,
        [classes.important]: important,
        [errorScrollClassName]: error,
        [classes.breakWords]: breakWords,
        [classes.marketing]: marketing && !notificationList,
        [classes.error]: error && !notificationList,
        [classes.errorList]: error && notificationList,
        [classes.success]: success && !notificationList,
        [classes.successList]: success && notificationList,
        [classes.warning]: warning && !notificationList,
        [classes.marketing]: marketing,
        [classes.warningList]: warning && notificationList,
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
      sx={sx}
    >
      {flag && (
        <Grid>
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
    </Grid>
  );
};
