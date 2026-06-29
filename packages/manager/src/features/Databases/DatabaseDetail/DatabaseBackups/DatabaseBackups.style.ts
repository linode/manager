import { styled } from '@mui/material/styles';

export const StyledDateTimeStack = styled('div', {
  label: 'StyledDateTimeStack',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    marginTop: theme.spacingFunction(24),
    marginBottom: theme.spacingFunction(16),
  },
}));

export const StyledRegionStack = styled('div', { label: 'StyledRegionStack' })(
  ({ theme }) => ({
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacingFunction(24),
      marginBottom: theme.spacingFunction(16),
    },
  })
);
