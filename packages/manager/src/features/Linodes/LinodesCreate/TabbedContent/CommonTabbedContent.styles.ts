import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

export const StyledGrid = styled(Grid, { label: 'StyledGrid' })(
  ({ theme }) => ({
    [theme.breakpoints.up('md')]: {
      maxWidth: '100%',
    },
    width: '100%',
    flexBasis: '100%',
    paddingTop: 0,
    paddingBottom: 0,
  })
);
