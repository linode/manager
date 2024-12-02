import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  '& a': {
    color: theme.textColors.linkActiveLight,
  },
  '& a:hover': {
    color: theme.tokens.color.Ultramarine[70],
  },
  '& p': {
    fontFamily: '"LatoWebBold", sans-serif',
  },
  fontSize: '0.9em',
}));
