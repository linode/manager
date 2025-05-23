import { Button } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

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
