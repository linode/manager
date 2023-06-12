import Button from 'src/components/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { styled } from '@mui/material/styles';

export const StyledRootContainer = styled(Paper, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  paddingTop: 17,
}));

export const StyledCopy = styled(Typography, {
  label: 'StyledCopy',
})(({ theme }) => ({
  lineHeight: '1.25rem',
  marginTop: theme.spacing(),
  marginBottom: theme.spacing(2),
  maxWidth: 960,
}));

export const StyledProvidersListGrid = styled(Grid, {
  label: 'StyledProvidersListGrid',
})(({ theme }) => ({
  marginBottom: 0,
  width: 'calc(100% + 24px)',
  '& .MuiGrid-item': {
    [theme.breakpoints.down(1100)]: {
      flexBasis: '50%',
      maxWidth: '50%',
    },
    [theme.breakpoints.down('sm')]: {
      flexBasis: '100%',
      maxWidth: '100%',
    },
  },
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(),
  },
}));

export const StyledButton = styled(Button, {
  label: 'StyledButton',
})<{ isButtonEnabled: boolean }>(({ theme, isButtonEnabled }) => ({
  borderRadius: 1,
  backgroundColor: theme.name === 'light' ? '#f5f6f7' : '#444',
  marginTop: theme.spacing(),
  minHeight: 70,
  paddingRight: `calc(${theme.spacing(3)} - 4px)`,
  paddingLeft: `calc(${theme.spacing(3)} - 4px)`,
  width: 'calc(100% - 8px)',
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
  },
  [theme.breakpoints.down('sm')]: {
    marginTop: 0,
    marginLeft: 0,
  },
  '&:hover': {
    backgroundColor: theme.color.grey6,
  },
  '& > span': {
    display: 'inline-block',
    width: '100%',
    color: theme.color.headline,
  },
  ...(isButtonEnabled && {
    border: `1px solid ${theme.palette.primary.main} !important`,
  }),
}));

export const StyledEnabledText = styled('span', {
  label: 'StyledEnabledText',
})(({ theme }) => ({
  fontFamily: theme.font.normal,
  marginLeft: 4,
}));

export const StyledNotice = styled(Notice, {
  label: 'StyledNotice',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
  fontSize: '0.875rem',
}));
