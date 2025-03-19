import { styled } from '@mui/material';

export const StyledPreContainerDiv = styled('div', { label: 'StyledDiv' })(
  ({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    minHeight: 34,
    marginBottom: theme.spacingFunction(6),
  })
);

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
