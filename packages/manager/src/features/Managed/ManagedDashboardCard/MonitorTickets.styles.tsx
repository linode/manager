import { styled } from '@mui/material/styles';

import Grid from '@mui/material/Unstable_Grid2';
import { Button } from 'src/components/Button/Button';

export const StyledButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    paddingLeft: 12,
    paddingRight: 12,
  },
}));

export const StyledGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(),
  textAlign: 'center',
}));
