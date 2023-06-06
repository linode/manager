import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

export const StyledHelperText = styled(Typography, {
  label: 'StyledHelperText',
})(({ theme }) => ({
  paddingTop: theme.spacing(),
  lineHeight: 1.5,
}));

export const StyledFieldsWrapper = styled('div', {
  label: 'StyledTextFieldWrapper',
})(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexFlow: 'row wrap',
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
