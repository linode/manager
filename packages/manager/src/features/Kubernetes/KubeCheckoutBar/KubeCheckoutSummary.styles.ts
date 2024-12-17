import { Box, IconButton, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledHeader = styled(Typography, {
  label: 'StyledHeader',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
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
})(() => ({
  '&:hover': {
    color: '#6e6e6e',
  },
  alignItems: 'flex-start',
  color: '#979797',
  marginTop: -4,
  padding: 0,
}));

export const StyledPriceBox = styled(Box, {
  label: 'StyledPriceBox',
})(({ theme }) => ({
  '& h3': {
    color: theme.palette.text.primary,
    fontFamily: theme.font.normal,
  },
}));
