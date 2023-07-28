import { styled } from '@mui/material/styles';

import Grid from '@mui/material/Unstable_Grid2';
import DashboardCard from './DashboardCard';

export const StyledMonitorStatusOuterGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  [theme.breakpoints.up('lg')]: {
    marginBottom: `calc(${theme.spacing(3)} + 2px)`,
  },
}));

export const StyledOuterContainerGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    flexWrap: 'nowrap',
  },
}));

export const StyledDashboardCard = styled(DashboardCard)(({ theme }) => ({
  backgroundColor: theme.bg.bgPaper,
  margin: `0 !important`,
  [theme.breakpoints.up('sm')]: {
    marginBottom: 20,
  },
  width: '100%',
}));

export const StyledStatusGrid = styled(Grid)(({ theme }) => ({
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    margin: `${theme.spacing(3)} ${theme.spacing(1)} !important`,
  },
}));
