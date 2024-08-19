import { styled } from '@mui/material/styles';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

export const StyledText = styled(Typography, {
  label: 'StyledText',
})(({ theme }) => ({
  lineHeight: 0.5,
  paddingLeft: 16,
  [theme.breakpoints.down('md')]: {
    lineHeight: 1,
  },
}));

export const StyledRootContainer = styled(Paper, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  marginTop: 25,
  padding: theme.spacing(3),
}));

export const StyledHelperText = styled(Typography, {
  label: 'StyledHelperText',
})(({ theme }) => ({
  lineHeight: 1.5,
  paddingTop: theme.spacing(),
}));
