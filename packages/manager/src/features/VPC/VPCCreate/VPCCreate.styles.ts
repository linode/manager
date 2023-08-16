import { styled } from '@mui/material/styles';

import { Typography } from 'src/components/Typography';

export const StyledBodyTypography = styled(Typography, {
  label: 'StyledBodyTypography',
})(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    maxWidth: '80%',
  },
}));

export const StyledHeaderTypography = styled(Typography, {
  label: 'StyledHeaderTypography',
})(({ theme }) => ({
  marginTop: theme.spacing(1),
}));
