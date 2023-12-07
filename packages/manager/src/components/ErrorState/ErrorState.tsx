import ErrorOutline from '@mui/icons-material/ErrorOutline';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Typography } from 'src/components/Typography';

import { SvgIconProps } from '../SvgIcon';

export interface ErrorStateProps {
  /**
   * An SVG to display in place of the error icon.
   */
  CustomIcon?: React.ComponentType<SvgIconProps>;
  /**
   * CSS properties to apply to the custom icon.
   */
  CustomIconStyles?: React.CSSProperties;
  /**
   * Reduces the padding on the root element.
   */
  compact?: boolean;
  /**
   * Minimal padding on the root element.
   */
  cozy?: boolean;
  /**
   * The error text to display.
   */
  errorText: JSX.Element | string;
}

export const ErrorState = (props: ErrorStateProps) => {
  const { CustomIcon } = props;
  const theme = useTheme();

  const sxIcon = {
    color: theme.color.red,
    height: 50,
    marginBottom: theme.spacing(2),
    width: 50,
  };

  return (
    <ErrorStateRoot alignItems="center" container justifyContent="center">
      <Grid data-testid="error-state">
        <StyledIconContainer>
          {CustomIcon ? (
            <CustomIcon
              data-qa-error-icon
              style={props.CustomIconStyles}
              sx={sxIcon}
            />
          ) : (
            <ErrorOutline data-qa-error-icon sx={sxIcon} />
          )}
        </StyledIconContainer>
        {typeof props.errorText === 'string' ? (
          <Typography
            data-qa-error-msg
            style={{ textAlign: 'center' }}
            variant="h3"
          >
            {props.errorText}
          </Typography>
        ) : (
          <div style={{ textAlign: 'center' }}>{props.errorText}</div>
        )}
      </Grid>
    </ErrorStateRoot>
  );
};

const StyledIconContainer = styled('div')({
  textAlign: 'center',
});

const ErrorStateRoot = styled(Grid)<Partial<ErrorStateProps>>(
  ({ theme, ...props }) => ({
    marginLeft: 0,
    padding: props.compact
      ? theme.spacing(5)
      : props.cozy
      ? theme.spacing(1)
      : theme.spacing(10),
    width: '100%',
  })
);
