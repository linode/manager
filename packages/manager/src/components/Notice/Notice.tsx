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
    '& svg': {
      left: `-${theme.spacing()}`,
      position: 'relative',
    },
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

export type NoticeVariant =
  | 'error'
  | 'info'
  | 'marketing'
  | 'success'
  | 'warning';

export interface NoticeProps extends Grid2Props {
  /**
   * If true, the error will be treated as "static" and will not be included in the error group.
   * This will essentially disable the scroll to error behavior.
   */
  bypassValidation?: boolean;
  /**
   * Additional classes to be applied to the root element.
   */
  className?: string;
  /**
   * The data-qa attribute to apply to the root element.
   */
  dataTestId?: string;
  /**
   * The error group this error belongs to. This is used to scroll to the error when the user clicks on the error.
   */
  errorGroup?: string;
  /**
   * If true, a flag will be displayed to the left of the error.
   */
  flag?: boolean;
  /**
   * If true, an icon will be displayed to the left of the error, reflecting the variant of the error.
   */
  important?: boolean;
  /**
   * The function to execute when/if the error is clicked.
   */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /**
   * The amount of spacing to apply to the bottom of the error.
   */
  spacingBottom?: 0 | 4 | 8 | 12 | 16 | 20 | 24 | 32;
  /**
   * The amount of spacing to apply to the left of the error.
   */
  spacingLeft?: number;
  /**
   * The amount of spacing to apply to the top of the error.
   */
  spacingTop?: 0 | 4 | 8 | 12 | 16 | 24 | 32;
  /**
   * Additional styles to apply to the root element.
   */
  sx?: SxProps;
  /**
   * The text to display in the error. If this is not provided, props.children will be used.
   */
  text?: string;
  /**
   * Props to apply to the Typography component that wraps the error text.
   */
  typeProps?: TypographyProps;
  /**
   * The variant of the error. This will determine the color treatment of the error.
   */
  variant?: NoticeVariant;
}

export const Notice = (props: NoticeProps) => {
  const {
    bypassValidation = false,
    children,
    className,
    dataTestId,
    errorGroup,
    flag,
    important,
    onClick,
    spacingBottom,
    spacingLeft,
    spacingTop,
    sx,
    text,
    typeProps,
    variant,
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

  const variantMap = {
    error: variant === 'error',
    info: variant === 'info',
    marketing: variant === 'marketing',
    success: variant === 'success',
    warning: variant === 'warning',
  };

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

  const errorScrollClassName = bypassValidation
    ? ''
    : errorGroup
    ? `error-for-scroll-${errorGroup}`
    : `error-for-scroll`;

  const dataAttributes = !variantMap.error
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
        [classes.error]: variantMap.error,
        [classes.errorList]: variantMap.error,
        [classes.flag]: flag,
        [classes.important]: important,
        [classes.info]: variantMap.info,
        [classes.infoList]: variantMap.info,
        [classes.marketing]: variantMap.marketing,
        [classes.marketing]: variantMap.marketing,
        [classes.root]: true,
        [classes.success]: variantMap.success,
        [classes.successList]: variantMap.success,
        [classes.warning]: variantMap.warning,
        [classes.warningList]: variantMap.warning,
        [errorScrollClassName]: variantMap.error,
        notice: true,
        ...(className && { [className]: true }),
      })}
      data-testid={`notice${variant ? `-${variant}` : ''}${
        important ? '-important' : ''
      }${flag ? '-flag' : ''}`}
      sx={{
        marginBottom: spacingBottom !== undefined ? spacingBottom : 24,
        marginLeft: spacingLeft !== undefined ? spacingLeft : 0,
        marginTop: spacingTop !== undefined ? spacingTop : 0,
        ...sx,
      }}
      {...dataAttributes}
      role="alert"
    >
      {flag && (
        <Grid data-testid="notice-with-flag-icon">
          <Flag className={classes.flag} />
        </Grid>
      )}
      {important &&
        ((variantMap.success && (
          <Check className={classes.icon} data-qa-success-img />
        )) ||
          ((variantMap.warning || variantMap.info) && (
            <Warning className={classes.icon} data-qa-warning-img />
          )) ||
          (variantMap.error && (
            <Error className={classes.icon} data-qa-error-img />
          )))}
      <div className={classes.inner} data-testid={dataTestId}>
        {innerText || _children}
      </div>
    </Grid>
  );
};
