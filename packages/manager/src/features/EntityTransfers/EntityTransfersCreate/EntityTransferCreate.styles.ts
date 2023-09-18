import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import { Notice } from 'src/components/Notice/Notice';

export const StyledNotice = styled(Notice, {
  label: 'StyledNotice',
})(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    marginLeft: theme.spacing(),
  },
}));

export const StyledRootGrid = styled(Grid, {
  label: 'StyledRootGrid',
})(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    justifyContent: 'center',
    margin: 0,
  },
}));

export const StyledSidebarGrid = styled(Grid, {
  label: 'StyledSidebarGrid',
})(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    '&.MuiGrid-item': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    padding: `0 ${theme.spacing(1)}`,
  },
}));
