import { styled } from '@mui/material/styles';

export const StyledDiv = styled('div', { label: 'StyledDiv' })(({ theme }) => ({
  '& > div': {
    flexGrow: 1,
    [theme.breakpoints.down('lg')]: {
      marginTop: theme.spacing(),
      width: '60%',
    },
    width: '33%',
  },
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-around',
  marginTop: theme.spacing(),
}));
