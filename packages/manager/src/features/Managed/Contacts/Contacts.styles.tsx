import { styled } from '@mui/material/styles';

import Grid from '@mui/material/Unstable_Grid2';
import { Typography } from 'src/components/Typography';

export const StyledWrapperGrid = styled(Grid)(({ theme }) => ({
  '&.MuiGrid-item': {
    paddingRight: 0,
    paddingTop: 0,
  },
  [theme.breakpoints.down('md')]: {
    marginRight: theme.spacing(),
  },
}));

export const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('lg')]: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
}));

export const StyledHeaderGrid = styled(Grid)(({ theme }) => ({
  margin: 0,
  width: '100%',
}));
