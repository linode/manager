import Grid, { Grid2Props } from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import Error from 'src/assets/icons/alert.svg';
import Check from 'src/assets/icons/check.svg';
import Flag from 'src/assets/icons/flag.svg';
import Warning from 'src/assets/icons/warning.svg';
import { Typography, TypographyProps } from 'src/components/Typography';

export const useStyles = makeStyles<
  void,
  'error' | 'icon' | 'important' | 'noticeText'
>()((theme: Theme, _params, classes) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  breakWords: {
    [`& .${classes.noticeText}`]: {
      wordBreak: 'break-all',
    },
  },
  error: {
    [`&.${classes.important}`]: {
      borderLeftWidth: 32,
    },
    animation: '$fadeIn 225ms linear forwards',
    borderLeft: `5px solid ${theme.palette.error.dark}`,
  },
  errorList: {
    borderLeft: `5px solid ${theme.palette.error.dark}`,
  },
  flag: {
    marginRight: theme.spacing(2),
  },
  icon: {
    color: 'white',
    left: -25, // This value must be static regardless of theme selection
    position: 'absolute',
  },
  important: {
    [`& .${classes.noticeText}`]: {
      fontFamily: theme.font.normal,
    },
    backgroundColor: theme.bg.bgPaper,
    padding: theme.spacing(2),
    paddingRight: 18,
  },
  info: {
    [`&.${classes.important}`]: {
      borderLeftWidth: 32,
    },
    animation: '$fadeIn 225ms linear forwards',
    borderLeft: `5px solid ${theme.palette.info.dark}`,
  },
  infoList: {
    borderLeft: `5px solid ${theme.palette.info.dark}`,
  },
  inner: {
    width: '100%',
  },
  marketing: {
    borderLeft: `5px solid ${theme.color.green}`,
  },
  noticeText: {
    fontFamily: theme.font.bold,
    fontSize: '1rem',
    lineHeight: '20px',
  },
  root: {
    '& + .notice': {
      marginTop: `${theme.spacing()} !important`,
    },
    [`& .${classes.error}`]: {
      borderLeftColor: theme.color.red,
    },
    [`& .${classes.important}`]: {
      backgroundColor: theme.bg.bgPaper,
    },
    alignItems: 'center',
    borderRadius: 1,
    display: 'flex',
    fontSize: '1rem',
    marginBottom: theme.spacing(2),
    maxWidth: '100%',
    padding: '4px 16px',
    paddingRight: 18,
    position: 'relative',
  },
  success: {
    [`&.${classes.important}`]: {
      borderLeftWidth: 32,
    },
    animation: '$fadeIn 225ms linear forwards',
    borderLeft: `5px solid ${theme.palette.success.dark}`,
  },
  successList: {
    borderLeft: `5px solid ${theme.palette.success.dark}`,
  },
  warning: {
    [`& .${classes.icon}`]: {
      color: '#555',
    },
    [`&.${classes.important}`]: {
      borderLeftWidth: 32,
    },
    animation: '$fadeIn 225ms linear forwards',
    borderLeft: `5px solid ${theme.palette.warning.dark}`,
  },
  warningList: {
    borderLeft: `5px solid ${theme.palette.warning.dark}`,
  },
}));

export interface NoticeProps extends Grid2Props {
  breakWords?: boolean;
  className?: string;
  dataTestId?: string;
  error?: boolean;
  errorGroup?: string;
  flag?: boolean;
  important?: boolean;
  info?: boolean;
  marketing?: boolean;
  notificationList?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  spacingBottom?: 0 | 4 | 8 | 12 | 16 | 20 | 24 | 32;
  spacingLeft?: number;
  spacingTop?: 0 | 4 | 8 | 12 | 16 | 24 | 32;
  success?: boolean;
  sx?: SxProps;
  text?: string;
  typeProps?: TypographyProps;
  warning?: boolean;
}

export const Notice = (props: NoticeProps) => {
  const {
    breakWords,
    children,
    className,
    dataTestId,
    error,
    errorGroup,
    flag,
    important,
    info,
    marketing,
    notificationList,
    onClick,
    spacingBottom,
    spacingLeft,
    spacingTop,
    success,
    sx,
    text,
    typeProps,
    warning,
  } = props;

  const { classes, cx } = useStyles();

  const innerText = text ? (
    <Typography
      {...typeProps}
      className={`${classes.noticeText} noticeText`}
      onClick={onClick}
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
        'data-qa-error': true,
        'data-qa-notice': true,
      };

  return (
    <Grid
      className={cx({
        [classes.breakWords]: breakWords,
        [classes.error]: error && !notificationList,
        [classes.errorList]: error && notificationList,
        [classes.important]: important,
        [classes.info]: info && !notificationList,
        [classes.infoList]: info && notificationList,
        [classes.marketing]: marketing,
        [classes.marketing]: marketing && !notificationList,
        [classes.root]: true,
        [classes.success]: success && !notificationList,
        [classes.successList]: success && notificationList,
        [classes.warning]: warning && !notificationList,
        [classes.warningList]: warning && notificationList,
        [errorScrollClassName]: error,
        notice: true,
        ...(className && { [className]: true }),
      })}
      style={{
        marginBottom: spacingBottom !== undefined ? spacingBottom : 24,
        marginLeft: spacingLeft !== undefined ? spacingLeft : 0,
        marginTop: spacingTop !== undefined ? spacingTop : 0,
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
          ((warning || info) && (
            <Warning className={classes.icon} data-qa-warning-img />
          )) ||
          (error && <Error className={classes.icon} data-qa-error-img />))}
      <div className={classes.inner} data-testid={dataTestId}>
        {innerText || _children}
      </div>
    </Grid>
  );
};
