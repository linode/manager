import { styled } from '@mui/material/styles';

export const StyledSummaryDiv = styled('div', {
  label: 'StyledSummaryDiv',
})(({ theme }) => ({
  display: 'flex',
  flex: 1,
  [theme.breakpoints.down('lg')]: {
    display: 'grid',
    gridTemplateColumns: '50% 2fr',
  },
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const StyledSummaryTextTypography = styled('p', {
  label: 'StyledSummaryTextTypography',
})(({ theme }) => ({
  margin: 0,
  '& strong': {
    paddingRight: theme.spacing(1),
  },
  paddingBottom: theme.spacing(2),
  whiteSpace: 'nowrap',
}));

export const StyledSummaryTextDiv = styled('div', {
  label: 'StyledSummaryTextDiv',
})(({ theme }) => ({
  '& strong': {
    paddingRight: theme.spacing(1),
  },
  '&:first-of-type': {
    paddingBottom: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    paddingBottom: theme.spacing(2),
  },
  whiteSpace: 'nowrap',
}));

export const StyledStatusDiv = styled('div', {
  label: 'StyledStatusDiv',
})(() => ({
  alignItems: 'center',
  display: 'inline-flex',
  textTransform: 'capitalize',
  verticalAlign: 'sub',
}));
