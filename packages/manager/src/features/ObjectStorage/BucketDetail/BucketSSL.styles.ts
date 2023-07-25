import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import { Typography } from 'src/components/Typography';

export const StyledHelperText = styled(Typography, {
  label: 'StyledHelperText',
})(({ theme }) => ({
  lineHeight: 1.5,
  paddingTop: theme.spacing(),
}));

export const StyledFieldsWrapper = styled('div', {
  label: 'StyledTextFieldWrapper',
})(() => ({
  alignItems: 'flex-start',
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
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
