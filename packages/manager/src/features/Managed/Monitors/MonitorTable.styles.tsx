import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

export const StyledGrid = styled(Grid, {
  label: 'StyledGrid',
})(({ theme }) => ({
  marginBottom: 5,
  [theme.breakpoints.down('md')]: {
    marginRight: theme.spacing(),
  },
}));
