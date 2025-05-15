import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';

export const StyledGrid = styled(Grid, { label: 'StyledGrid' })(
  ({ theme }) => ({
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
      marginBottom: theme.spacing(0.5),
      marginLeft: 2,
      marginTop: theme.spacing(1),
    },
  })
);
