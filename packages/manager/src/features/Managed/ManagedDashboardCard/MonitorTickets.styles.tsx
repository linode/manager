import { Button } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

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
