import Close from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

import { Button } from 'src/components/Button/Button';
import { Typography } from 'src/components/Typography';

export const StyledButton = styled(Button, {
  label: 'StyledButton',
})(({ theme }) => ({
  backgroundColor: 'inherit',
  border: 'none',
  minWidth: 0,
  textDecoration: 'none',
  [theme.breakpoints.down('md')]: {
    visibility: 'visible',
  },
  visibility: 'hidden',
}));

export const StyledSubmitButton = styled(Button, {
  label: 'StyledSubmitButton',
})(({ theme }) => ({
  marginLeft: 0,
  marginRight: 0,
  marginTop: theme.spacing(3),
  width: '100%',
}));

export const StyledClose = styled(Close, {
  label: 'StyledClose',
})(({ theme }) => ({
  '& svg': { height: 11, width: 11 },
  color: theme.color.grey1,
}));

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  color: theme.color.green,
  fontSize: '1rem',
  fontWeight: 'bold',
  marginTop: theme.spacing(3),
}));

export const StyledHeaderTypography = styled(Typography, {
  label: 'StyledHeaderTypography',
})(({ theme }) => ({
  color: theme.color.green,
  fontSize: '1.25rem',
  fontWeight: 'bold',
  lineHeight: '1.5rem',
}));

export const StyledRowDiv = styled('div', {
  label: 'StyledRowDiv',
})(({ theme }) => ({
  '&:first-of-type': {
    borderTop: `solid 1px ${theme.color.border2}`,
  },
  '&:hover > button': {
    visibility: 'visible',
  },
  alignItems: 'center',
  borderBottom: `solid 1px ${theme.color.border2}`,
  display: 'flex',
  justifyContent: 'space-between',
  padding: `5px 0px`,
}));

export const StyledRowBoxDiv = styled('div', {
  label: 'StyledRowBoxDiv',
})(({ theme }) => ({
  marginTop: theme.spacing(3),
  maxHeight: '75vh',
  overflowY: 'auto',
}));
