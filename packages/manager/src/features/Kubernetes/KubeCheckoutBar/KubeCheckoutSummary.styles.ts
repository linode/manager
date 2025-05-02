import { Box, IconButton, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledHeader = styled(Typography, {
  label: 'StyledHeader',
})(({ theme }) => ({
  font: theme.font.bold,
  fontSize: '16px',
  paddingBottom: theme.spacing(0.5),
  paddingTop: theme.spacing(0.5),
}));

export const StyledBox = styled(Box, {
  label: 'StyledBox',
})(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

export const StyledNodePoolSummaryBox = styled(Box, {
  label: 'StyledNodePoolSummaryBox',
})(() => ({
  '& $textField': {
    width: 53,
  },
  display: 'flex',
  flexDirection: 'column',
}));

export const StyledIconButton = styled(IconButton, {
  label: 'StyledIconButton',
})(({ theme }) => ({
  '&:hover': {
    color: theme.tokens.color.Neutrals[70],
  },
  alignItems: 'flex-start',
  color: theme.tokens.color.Neutrals[60],
  marginTop: -4,
  padding: 0,
}));

export const StyledPriceBox = styled(Box, {
  label: 'StyledPriceBox',
})(({ theme }) => ({
  '& h3': {
    color: theme.palette.text.primary,
    font: theme.font.normal,
  },
}));
