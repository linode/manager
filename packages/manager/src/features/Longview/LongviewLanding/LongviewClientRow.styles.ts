import { styled } from '@mui/material/styles';

import { Grid } from 'src/components/Grid';

export const StyledGrid = styled(Grid, { label: 'StyledGrid' })(
  ({ theme }) => ({
    boxSizing: 'border-box',
    marginLeft: 0,
    marginRigh: 0,
    marginTop: 0,
    [theme.breakpoints.down('md')]: {
      marginBottom: 30,
    },
  })
);
