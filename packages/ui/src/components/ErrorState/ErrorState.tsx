import ErrorOutline from '@mui/icons-material/ErrorOutline';
import Grid from '@mui/material/Grid';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Button } from '../Button';
import { Typography } from '../Typography';

import type { SvgIconProps } from '../SvgIcon';
import type { SxProps, Theme } from '@mui/material/styles';

export interface ActionButtonProps {
  onClick: () => void;
  text: string;
}

export interface ErrorStateProps {
  actionButtonProps?: ActionButtonProps;
  /**
   * Reduces the padding on the root element.
   */
  compact?: boolean;
  /**
   * An SVG to display in place of the error icon.
   */
  CustomIcon?: React.ComponentType<SvgIconProps>;

  /**
   * CSS properties to apply to the custom icon.
   */
  CustomIconStyles?: React.CSSProperties;
  errorText: JSX.Element | string;

  /**
   * Styles applied to the error text
   */
  typographySx?: SxProps<Theme>;
}

export const ErrorState = (props: ErrorStateProps) => {
  const { CustomIcon, actionButtonProps, compact, typographySx } = props;
  const theme = useTheme();

  const sxIcon = {
    color: theme.color.red,
    height: 50,
    marginBottom: theme.spacing(2),
    width: 50,
  };

  return (
    <ErrorStateRoot
      alignItems="center"
      compact={compact}
      container
      justifyContent="center"
    >
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
            sx={typographySx}
            variant="h3"
          >
            {props.errorText}
          </Typography>
        ) : (
          <div style={{ textAlign: 'center' }}>{props.errorText}</div>
        )}
        {actionButtonProps ? (
          <div style={{ textAlign: 'center' }}>
            <Button
              onClick={() => {
                actionButtonProps.onClick?.();
              }}
              title={actionButtonProps.text}
            >
              {actionButtonProps.text}
            </Button>
          </div>
        ) : null}
      </Grid>
    </ErrorStateRoot>
  );
};

const StyledIconContainer = styled('div')({
  textAlign: 'center',
});

const ErrorStateRoot = styled(Grid, {
  label: 'ErrorStateRoot',
  shouldForwardProp: (prop) => prop !== 'compact',
})<Partial<ErrorStateProps>>(({ theme, ...props }) => ({
  marginLeft: 0,
  padding: props.compact ? theme.spacing(5) : theme.spacing(10),
  width: '100%',
}));
