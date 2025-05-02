import { Button, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledButton = styled(Button, {
  label: 'StyledButton',
})(({ theme }) => ({
  marginTop: theme.spacing(),
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  marginBottom: theme.spacing(),
  [theme.breakpoints.down('md')]: {
    marginLeft: theme.spacing(),
  },
}));
