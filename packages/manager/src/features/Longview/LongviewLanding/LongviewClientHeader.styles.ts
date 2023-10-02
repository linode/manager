import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2/Grid2';

import { Button } from 'src/components/Button/Button';

export const StyledButton = styled(Button, { label: 'StyledButton' })({
  '&:hover': {
    backgroundColor: 'inherit',
    color: 'inherit',
    textDecoration: 'underline',
  },
  fontSize: '0.875rem',
  padding: 0,
  textAlign: 'left',
});

export const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    marginTop: theme.spacing(1),
  },
}));

export const StyledRootGrid = styled(Grid, { label: 'StyledRootGrid' })(
  ({ theme }) => ({
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    width: '100%',
    '& a': {
      color: theme.textColors.linkActiveLight,
    },
    '& a:hover': {
      color: theme.palette.primary.main,
    },
    [theme.breakpoints.down('lg')]: {
      alignItems: 'center',
      flexDirection: 'row',
    },
  })
);

export const StyledUpdatesGrid = styled(Grid, { label: 'StyledUpdatesGrid' })(
  ({ theme }) => ({
    boxSizing: 'border-box',
    margin: 0,
    [theme.breakpoints.down('lg')]: {
      marginRight: theme.spacing(2),
    },
  })
);
