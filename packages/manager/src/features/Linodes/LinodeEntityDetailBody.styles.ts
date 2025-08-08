import { Stack } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledIPStack = styled(Stack, { label: 'StyledIPStack' })(
  ({ theme }) => ({
    [theme.breakpoints.down('md')]: {
      alignItems: 'start',
      display: 'flex',
      flexDirection: 'column',
      '& > div:first-child': {
        marginBottom: theme.spacingFunction(2),
      },
    },
    [theme.breakpoints.down(1275)]: {
      '& > div:first-child': {
        marginLeft: theme.spacingFunction(0),
      },
    },
  })
);
