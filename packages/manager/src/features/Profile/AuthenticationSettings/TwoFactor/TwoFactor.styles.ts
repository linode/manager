import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

import type { TwoFactorProps } from './TwoFactor';

export const StyledRootContainer = styled('div', {
  label: 'StyledRootContainer',
})<TwoFactorProps>(({ theme, ...props }) => ({
  ...(props.disabled && {
    '& *': {
      color: theme.color.disabledText,
    },
  }),
}));

export const StyledCTAWrapper = styled('div', {
  label: 'StyledCTAWrapper',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'left',
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(3),
}));

export const StyledCopy = styled(Typography, {
  label: 'StyledCopy',
})(({ theme }) => ({
  lineHeight: '20px',
  marginBottom: theme.spacing(),
  marginTop: theme.spacing(),
  maxWidth: 960,
}));
