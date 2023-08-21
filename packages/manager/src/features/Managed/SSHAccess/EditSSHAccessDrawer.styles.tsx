import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import { Typography } from 'src/components/Typography';

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  marginBottom: theme.spacing(1.25),
}));

export const StyledIPGrid = styled(Grid, {
  label: 'StyledIPGrid',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    paddingBottom: '0px',
  },
}));

export const StyledPortGrid = styled(Grid, {
  label: 'StyledPortGrid',
})(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    paddingTop: '0px',
  },
}));
