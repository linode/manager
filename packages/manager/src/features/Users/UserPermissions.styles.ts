import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import Select from 'src/components/EnhancedSelect/Select';
import { Paper } from 'src/components/Paper';

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
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(1),
    width: '100%',
  },
}));

export const StyledSubHeaderGrid = styled(Grid, {
  label: 'StyledSubHeaderGrid',
})(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    padding: 0,
  },
}));

export const StyledPaper = styled(Paper, {
  label: 'StyledPaper',
})(({ theme }) => ({
  paddingBottom: 0,
  paddingTop: 0,
  [theme.breakpoints.down('sm')]: {
    paddingBottom: theme.spacing(2),
  },
}));
