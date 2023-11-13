import { styled } from '@mui/material';

export const StyledPreContainerDiv = styled('div', { label: 'StyledDiv' })({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  minHeight: 48,
});

export const StyledRootDiv = styled('div', { label: 'StyledRootDiv' })(
  ({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    [theme.breakpoints.only('sm')]: {
      marginLeft: theme.spacing(),
    },
    [theme.breakpoints.only('xs')]: {
      marginLeft: theme.spacing(),
    },
  })
);
