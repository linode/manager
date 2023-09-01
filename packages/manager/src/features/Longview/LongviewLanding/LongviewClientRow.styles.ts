import { styled } from '@mui/material/styles';

import { Grid } from 'src/components/Grid';

export const StyledGrid = styled(Grid, { label: 'StyledGrid' })(
  ({ theme }) => ({
    boxSizing: 'border-box',
    margin: 0,
    padding: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginBottom: 30,
    },
  })
);
