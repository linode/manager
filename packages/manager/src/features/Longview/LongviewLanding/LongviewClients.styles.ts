import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

export const StyledCTAGrid = styled(Grid, { label: 'StyledCTAGrid' })(
  ({ theme }) => ({
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  })
);

export const StyledHeadingGrid = styled(Grid, { label: 'StyledHeadingGrid' })(
  ({ theme }) => ({
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(),
    width: '100%',
    [theme.breakpoints.down('lg')]: {
      marginLeft: 0,
      marginRight: 0,
    },
  })
);

export const StyledSearchbarGrid = styled(Grid, {
  label: 'StyledSearchbarGrid',
})(({ theme }) => ({
  boxSizing: 'border-box',
  margin: 0,
  '& > div': {
    width: '300px',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
  [theme.breakpoints.only('md')]: {
    '&.MuiGrid-item': {
      paddingLeft: 0,
    },
  },
}));

export const StyledSortSelectGrid = styled(Grid, {
  label: 'StyledSortSelectGrid',
})(({ theme }) => ({
  alignItems: 'center',
  boxSizing: 'border-box',
  display: 'flex',
  flexFlow: 'row nowrap',
  margin: 0,
  paddingBottom: 0,
  paddingTop: 0,
  [theme.breakpoints.up('xs')]: {
    width: 221,
  },
  width: 210,
}));
