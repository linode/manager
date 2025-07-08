import React from 'react';
import { useStyles } from 'tss-react/mui';

import {
  CheckIcon,
  ErrorIcon,
  InfoIcon,
  LightBulbIcon,
  WarningIcon,
} from '../../assets/icons';
import { Box } from '../Box';
import { Typography } from '../Typography';
import { StyledIconBox, StyledNoticeBox } from './Notice.styles';

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
   * If true, the width of the notice will only span the content instead of the container.
   */
  fitContentWidth?: boolean;
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
    fitContentWidth = false,
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

  const { cx } = useStyles();

  const errorScrollClassName = bypassValidation
    ? ''
    : errorGroup
      ? `error-for-scroll-${errorGroup}`
      : `error-for-scroll`;

  const dataAttributes =
    variant !== 'error'
      ? {
          'data-qa-notice': true,
        }
      : {
          'data-qa-error': true,
          'data-qa-notice': true,
        };

  return (
    <StyledNoticeBox
      className={cx(
        'notice',
        { [errorScrollClassName]: variant === 'error' },
        className,
      )}
      data-testid={dataTestId ?? `notice${variant ? `-${variant}` : ''}`}
      role="alert"
      sx={[
        (theme) => ({
          marginBottom:
            spacingBottom !== undefined
              ? `${spacingBottom}px`
              : theme.spacingFunction(16),
          marginLeft: spacingLeft !== undefined ? `${spacingLeft}px` : 0,
          marginTop: spacingTop !== undefined ? `${spacingTop}px` : 0,
          width: fitContentWidth ? 'fit-content' : '100%',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      variant={variant ?? 'info'}
      {...dataAttributes}
      {...rest}
    >
      <StyledIconBox
        sx={{
          alignSelf: forceImportantIconVerticalCenter ? 'center' : 'flex-start',
        }}
      >
        {variant === 'error' && <ErrorIcon />}
        {variant === 'info' && <InfoIcon />}
        {variant === 'success' && <CheckIcon />}
        {variant === 'tip' && <LightBulbIcon />}
        {variant === 'warning' && <WarningIcon />}
      </StyledIconBox>
      <Box sx={{ width: '100%' }}>
        {text || typeof children === 'string' ? (
          <Typography {...typeProps}>{text ?? children}</Typography>
        ) : (
          children
        )}
      </Box>
    </StyledNoticeBox>
  );
};
