import * as React from 'react';

import {
  CheckIcon,
  ErrorIcon,
  InfoIcon,
  LightBulbIcon,
  WarningIcon,
} from '../../assets/icons';
import { Box } from '../Box';
import { Typography } from '../Typography';
import { useStyles } from './Notice.styles';

import type { BoxProps } from '../Box';
import type { TypographyProps } from '../Typography';

export type NoticeVariant = 'error' | 'info' | 'success' | 'tip' | 'warning';

export interface NoticeProps extends BoxProps {
  /**
   * If true, the error will be treated as "static" and will not be included in the error group.
   * This will essentially disable the scroll to error behavior.
   * **Note:** This only applies to notice variants of "error".
   */
  bypassValidation?: boolean;
  /**
   * The data-qa attribute to apply to the root element.
   */
  dataTestId?: string;
  /**
   * The error group this error belongs to. This is used to scroll to the error when the user clicks on the error.
   */
  errorGroup?: string;
  /**
   * If true, the important icon will be vertically centered with the text no matter the height of the text.
   */
  forceImportantIconVerticalCenter?: boolean;
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
   * The text to display in the notice. If this is not provided, props.children will be used.
   */
  text?: string;
  /**
   * Props to apply to the Typography component that wraps the error text.
   */
  typeProps?: TypographyProps;
  /**
   * The variant of the notice. This will determine the color treatment of the error.
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

- Success (green line)
- Info (blue line)
- Error (red line)
- Warning (yellow line)
 */
export const Notice = (props: NoticeProps) => {
  const {
    bypassValidation = false,
    children,
    className,
    dataTestId,
    errorGroup,
    forceImportantIconVerticalCenter = false,
    spacingBottom,
    spacingLeft,
    spacingTop,
    sx,
    text,
    typeProps,
    variant,
    ...rest
  } = props;

  const { classes, cx } = useStyles();

  const variantMap = {
    error: variant === 'error',
    info: variant === 'info',
    success: variant === 'success',
    tip: variant === 'tip',
    warning: variant === 'warning',
  };

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
    <Box
      className={cx(
        classes.root,
        {
          [classes.error]: variantMap.error,
          [classes.info]: variantMap.info || variantMap.tip,
          [classes.success]: variantMap.success,
          [classes.warning]: variantMap.warning,
          [errorScrollClassName]: variantMap.error,
        },
        'notice',
        className,
      )}
      data-testid={dataTestId ?? `notice${variant ? `-${variant}` : ''}`}
      role="alert"
      sx={[
        (theme) => ({
          marginBottom:
            spacingBottom !== undefined
              ? `${spacingBottom}px`
              : theme.spacingFunction(8),
          marginLeft: spacingLeft !== undefined ? `${spacingLeft}px` : 0,
          marginTop: spacingTop !== undefined ? `${spacingTop}px` : 0,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...dataAttributes}
      {...rest}
    >
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignSelf: forceImportantIconVerticalCenter ? 'center' : 'flex-start',
          marginRight: theme.spacingFunction(8),
        })}
      >
        {variantMap.error && <ErrorIcon className={classes.icon} />}
        {variantMap.info && <InfoIcon className={classes.icon} />}
        {variantMap.success && <CheckIcon className={classes.icon} />}
        {variantMap.tip && <LightBulbIcon className={classes.icon} />}
        {variantMap.warning && <WarningIcon className={classes.icon} />}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
        {text || typeof children === 'string' ? (
          <Typography {...typeProps}>{text ?? children}</Typography>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
};
