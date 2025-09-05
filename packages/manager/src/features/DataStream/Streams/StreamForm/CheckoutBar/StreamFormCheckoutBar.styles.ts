import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledHeader = styled(Typography, {
  label: 'StyledHeader',
})(({ theme }) => ({
  font: theme.font.bold,
  fontSize: theme.tokens.font.FontSize.M,
  lineHeight: theme.tokens.font.LineHeight.Xs,
}));
