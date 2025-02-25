import { Button, Notice, Paper, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';

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
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(),
  maxWidth: 960,
}));

export const StyledProvidersListGrid = styled(Grid, {
  label: 'StyledProvidersListGrid',
})(({ theme }) => ({
  '& .MuiGrid-item': {
    [theme.breakpoints.down('sm')]: {
      flexBasis: '100%',
      maxWidth: '100%',
    },
    [theme.breakpoints.down(1100)]: {
      flexBasis: '50%',
      maxWidth: '50%',
    },
  },
  marginBottom: 0,
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(),
  },
  width: 'calc(100% + 24px)',
}));

export const StyledButton = styled(Button, {
  label: 'StyledButton',
  shouldForwardProp: (propName) => propName !== 'isButtonEnabled',
})<{ isButtonEnabled: boolean }>(({ isButtonEnabled, theme }) => ({
  '& > span': {
    color: theme.color.headline,
    display: 'inline-block',
    width: '100%',
  },
  '&:hover': {
    backgroundColor: theme.color.grey6,
  },
  backgroundColor:
    theme.name === 'light'
      ? theme.tokens.color.Ultramarine[5]
      : theme.tokens.color.Ultramarine[80],
  borderRadius: 1,
  marginTop: theme.spacing(),
  minHeight: 70,
  paddingLeft: `calc(${theme.spacing(3)} - 4px)`,
  paddingRight: `calc(${theme.spacing(3)} - 4px)`,
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
  },
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    marginTop: 0,
  },
  width: 'calc(100% - 8px)',
  ...(isButtonEnabled && {
    border: `1px solid ${theme.palette.primary.main} !important`,
  }),
}));

export const StyledEnabledText = styled('span', {
  label: 'StyledEnabledText',
})(({ theme }) => ({
  font: theme.font.normal,
  marginLeft: 4,
}));

export const StyledNotice = styled(Notice, {
  label: 'StyledNotice',
})(({ theme }) => ({
  font: theme.font.bold,
  fontSize: '0.875rem',
}));
