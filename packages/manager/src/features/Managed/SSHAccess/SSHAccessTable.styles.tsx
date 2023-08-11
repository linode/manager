import { styled } from '@mui/material/styles';

export const StyledDiv = styled('div', {
  label: 'StyledDiv',
})(({ theme }) => ({
  '&:before': {
    display: 'none',
  },
  marginTop: theme.spacing(4),
}));
