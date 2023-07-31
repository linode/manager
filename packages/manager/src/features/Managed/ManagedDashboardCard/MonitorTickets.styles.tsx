import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import { Button } from 'src/components/Button/Button';

export const StyledButton = styled(Button, { label: 'StyledButton' })(
  ({ theme }) => ({
    [theme.breakpoints.down('md')]: {
      paddingLeft: 12,
      paddingRight: 12,
    },
  })
);

export const StyledGrid = styled(Grid, { label: 'StyledGridIcon' })(
  ({ theme }) => ({
    padding: theme.spacing(),
    textAlign: 'center',
  })
);
