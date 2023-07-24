import { styled } from '@mui/material/styles';

import Grid from '@mui/material/Unstable_Grid2';

export const StyledRootGrid = styled(Grid)(({ theme }) => ({
  // padding: theme.spacing(3),
  // paddingBottom: 0,
  // width: '100% !important',
}));

export const StyledHeaderGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(3),
  paddingBottom: 0,
}));
