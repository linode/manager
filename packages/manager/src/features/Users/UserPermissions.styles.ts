import { Paper } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

import { CircleProgress } from 'src/components/CircleProgress';
import Select from 'src/components/EnhancedSelect/Select';

export const StyledSelect = styled(Select, {
  label: 'StyledSelect',
})(({ theme }) => ({
  '& .react-select__menu, & .input': {
    marginLeft: theme.spacing(1),
    right: 0,
    textAlign: 'left' as const,
    width: 125,
  },
  '& .react-select__menu-list': {
    width: '100%',
  },
  '& > div': {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  '& label': {
    marginTop: 6,
  },
}));

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
  paddingLeft: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(2),
  },
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
