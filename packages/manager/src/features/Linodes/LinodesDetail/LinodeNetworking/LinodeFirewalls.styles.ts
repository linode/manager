import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import { Typography } from 'src/components/Typography';

export const StyledDiv = styled('div')(() => ({
  marginTop: '20px',
}));

export const StyledGrid = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.color.white,
  margin: 0,
  width: '100%',
}));

export const StyledHeadline = styled(Typography)(() => ({
  lineHeight: '1.5rem',
  marginBottom: 8,
  marginLeft: 15,
  marginTop: 8,
}));
