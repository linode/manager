import Grid from '@mui/material/Unstable_Grid2';
import TextField from 'src/components/TextField';
import { styled } from '@mui/material/styles';

export const StyledWrapper = styled('div', {
  label: 'StyledTextArea',
})(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexFlow: 'row wrap',
  [theme.breakpoints.down('lg')]: {
    justifyContent: 'flex-start',
  },
}));

export const StyledTextArea = styled(TextField, {
  label: 'StyledTextArea',
})(() => ({
  width: '100%',
}));

export const StyledCertWrapper = styled(Grid, {
  label: 'StyledCertWrapper',
})(({ theme }) => ({
  paddingRight: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    padding: 0,
  },
}));

export const StyledKeyWrapper = styled(Grid, {
  label: 'StyledKeyWrapper',
})(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    padding: 0,
  },
}));
