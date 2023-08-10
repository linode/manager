import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import Error from 'src/assets/icons/error.svg';
import { H1Header } from 'src/components/H1Header/H1Header';

export const StyledDiv = styled('div', {
  label: 'StyledDiv',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: `${theme.spacing(10)} ${theme.spacing(4)}`,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
}));

export const StyledGrid = styled(Grid, {
  label: 'StyledGrid',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: `${theme.spacing(10)} ${theme.spacing(4)}`,
}));

export const StyledError = styled(Error, {
  label: 'StyledError',
})(({ theme }) => ({
  color: theme.palette.text.primary,
  height: 60,
  marginBottom: theme.spacing(4),
  width: 60,
}));

export const StyledH1Header = styled(H1Header, {
  label: 'StyledH1Header',
})(({ theme }) => ({
  marginBottom: theme.spacing(),
  [theme.breakpoints.down('md')]: {
    marginLeft: theme.spacing(),
  },
}));

export const StyledRootGrid = styled(Grid, {
  label: 'StyledRootGrid',
})({
  '&.MuiGrid-container': {
    width: 'calc(100% + 16px)',
  },
  padding: 0,
});
