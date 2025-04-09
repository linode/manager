import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';

export const StyledGrid = styled(Grid, { label: 'StyledGrid' })(
  ({ theme }) => ({
    marginTop: theme.spacing(2),
  })
);

export const StyledLink = styled(Link, {
  label: 'StyledLink',
})(({ theme }) => ({
  '&:hover': {
    color: theme.color.red,
  },
  marginLeft: theme.spacing(1),
  transition: 'color 225ms ease-in-out',
}));

export const StyledDateTimeDisplay = styled(DateTimeDisplay, {
  label: 'StyledDateTimeDisplay',
})(({ theme }) => ({
  color: theme.color.red,
}));
