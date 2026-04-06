import { Box, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledSummaryBox = styled(Box, {
  label: 'StyledSummaryBox',
})(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    display: 'grid',
    gridTemplateColumns: '50% 2fr',
  },
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const StyledSummaryTextTypography = styled(Typography, {
  label: 'StyledSummaryTextTypography',
})(({ theme }) => ({
  '& strong': {
    paddingRight: theme.spacing(1),
  },
  paddingBottom: theme.spacing(2),
  whiteSpace: 'nowrap',
}));

export const StyledSummaryTextBox = styled(Box, {
  label: 'StyledSummaryTextBox',
})(({ theme }) => ({
  '& strong': {
    paddingRight: theme.spacing(1),
  },
  '&:first-of-type': {
    paddingBottom: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    paddingBottom: theme.spacing(2),
  },
  whiteSpace: 'nowrap',
}));

export const StyledTitleTypography = styled(Typography, {
  label: 'StyledCurrentConfigurationTypography',
})(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const StyledStatusBox = styled(Box, {
  label: 'StyledStatusBox',
})(() => ({
  alignItems: 'center',
  display: 'inline-flex',
  textTransform: 'capitalize',
  verticalAlign: 'sub',
}));
