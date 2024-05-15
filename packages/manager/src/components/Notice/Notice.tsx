import Grid, { Grid2Props } from '@mui/material/Unstable_Grid2';
import { SxProps } from '@mui/system';
import * as React from 'react';

import Error from 'src/assets/icons/alert.svg';
import Check from 'src/assets/icons/check.svg';
import Warning from 'src/assets/icons/warning.svg';
import { Typography, TypographyProps } from 'src/components/Typography';

import { useStyles } from './Notice.styles';

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
   * **Note:** This only applies to notice variants of "error".
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

/**
## Usage

- Appear within the page or modal
- Might be triggered by user action
- Typically used to alert the user to a new service, limited availability, or a potential consequence of the action being taken
- Consider using a [Dismissible Banner](/docs/components-notifications-dismissible-banners--beta-banner) if it’s not critical information

## Types of Notices:

- Success/Marketing (green line)
- Info (blue line)
- Error/critical (red line)
- Warning (yellow line)
 */
export const Notice = (props: NoticeProps) => {
  const {
    bypassValidation = false,
    children,
    className,
    dataTestId,
    errorGroup,
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
        [classes.important]: important,
        [classes.info]: variantMap.info,
        [classes.infoList]: variantMap.info,
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
      }`}
      sx={(theme) => ({
        marginBottom:
          spacingBottom !== undefined ? `${spacingBottom}px` : theme.spacing(3),
        marginLeft: spacingLeft !== undefined ? `${spacingLeft}px` : 0,
        marginTop: spacingTop !== undefined ? `${spacingTop}px` : 0,
        sx,
      })}
      {...dataAttributes}
      role="alert"
    >
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
