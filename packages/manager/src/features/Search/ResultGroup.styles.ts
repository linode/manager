import { styled } from '@mui/material/styles';

import { Button } from 'src/components/Button/Button';
import { Typography } from 'src/components/Typography';

export const StyledButton = styled(Button, {
  label: 'StyledButton',
})(({ theme }) => ({
  marginTop: theme.spacing(),
  width: '10%',
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  marginBottom: theme.spacing(),
  [theme.breakpoints.down('md')]: {
    marginLeft: theme.spacing(),
  },
}));
