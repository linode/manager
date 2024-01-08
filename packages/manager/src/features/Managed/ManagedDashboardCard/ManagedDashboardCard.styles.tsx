import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import DashboardCard from './DashboardCard';

export const StyledMonitorStatusOuterGrid = styled(Grid, {
  label: 'StyledMonitorStatusOuterGrid',
})(({ theme }) => ({
  marginBottom: theme.spacing(1),
  [theme.breakpoints.up('lg')]: {
    marginBottom: `calc(${theme.spacing(3)} + 2px)`,
  },
}));

export const StyledOuterContainerGrid = styled(Grid, {
  label: 'StyledOuterContainerGrid',
})(({ theme }) => ({
  flexDirection: 'column',
  margin: '-8px',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-evenly',
  },
}));

export const StyledDashboardCard = styled(DashboardCard, {
  label: 'StyledDashboardCard',
})(({ theme }) => ({
  backgroundColor: theme.bg.bgPaper,
  margin: `0 !important`,
  [theme.breakpoints.up('sm')]: {
    marginBottom: 20,
  },
  width: '100%',
}));

export const StyledStatusGrid = styled(Grid, { label: 'StyledStatusGrid' })(
  ({ theme }) => ({
    position: 'relative',
    [theme.breakpoints.up('sm')]: {
      margin: `${theme.spacing(3)} ${theme.spacing(1)} !important`,
    },
  })
);
