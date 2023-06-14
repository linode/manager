import Typography from 'src/components/core/Typography';
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
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
  justifyContent: 'left',
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

export const StyledCopy = styled(Typography, {
  label: 'StyledCopy',
})(({ theme }) => ({
  lineHeight: '20px',
  marginTop: theme.spacing(),
  marginBottom: theme.spacing(),
  maxWidth: 960,
}));
