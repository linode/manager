import * as React from 'react';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { Typography } from 'src/components/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { useTheme, styled } from '@mui/material/styles';

interface ErrorStateProps {
  compact?: boolean;
  cozy?: boolean;
  CustomIcon?: React.ComponentType<SvgIconProps>;
  CustomIconStyles?: React.CSSProperties;
  errorText: string | JSX.Element;
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
    <ErrorStateRoot container justifyContent="center" alignItems="center">
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
            style={{ textAlign: 'center' }}
            variant="h3"
            data-qa-error-msg
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
