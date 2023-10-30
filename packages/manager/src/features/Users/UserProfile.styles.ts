import { styled } from '@mui/material/styles';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

export const StyledWrapper = styled(Paper, {
  label: 'StyledWrapper',
})(({ theme }) => ({
  '&:not(:last-child)': {
    marginBottom: theme.spacing(3),
  },
  backgroundColor: theme.color.white,
  marginTop: theme.spacing(),
}));

export const StyledTitle = styled(Typography, {
  label: 'StyledTitle',
})(({ theme }) => ({
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    marginLeft: theme.spacing(),
  },
}));
