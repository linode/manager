import { CircleProgress, Paper } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';

export const StyledDivWrapper = styled('div', {
  label: 'StyledDivWrapper',
})(({ theme }) => ({
  marginTop: theme.spacing(2),
  paddingBottom: 0,
}));

export const StyledHeaderGrid = styled(Grid, {
  label: 'StyledHeaderGrid',
})(({ theme }) => ({
  padding: 0,
  [theme.breakpoints.down('sm')]: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  width: '100%',
}));

export const StyledFullAccountAccessToggleGrid = styled(Grid, {
  label: 'StyledFullAccountAccessToggleGrid',
})(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: 0,
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(2),
  },
}));

export const StyledUnrestrictedGrid = styled(Grid, {
  label: 'StyledUnrestrictedGrid',
})(({ theme }) => ({
  paddingBottom: theme.spacing(2),
}));

export const StyledPaper = styled(Paper, {
  label: 'StyledPaper',
})(({ theme }) => ({
  paddingBottom: 0,
  [theme.breakpoints.down('sm')]: {
    padding: 0,
  },
}));

export const StyledPermPaper = styled(Paper, {
  label: 'StyledPermPaper',
})(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export const StyledCircleProgress = styled(CircleProgress, {
  label: 'StyledCircleProgress',
})(({ theme }) => ({
  marginTop: theme.spacing(2),
}));
