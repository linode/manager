import { styled } from '@mui/material/styles';

import Select from 'src/components/EnhancedSelect/Select';
import { Typography } from 'src/components/Typography';

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

export const StyledHeaderGrid = styled(Typography, {
  label: 'StyledHeaderGrid',
})(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(2),
    width: '100%',
  },
}));

export const StyledSubHeaderGrid = styled(Typography, {
  label: 'StyledSubHeaderGrid',
})(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    marginTop: theme.spacing(),
  },
}));
