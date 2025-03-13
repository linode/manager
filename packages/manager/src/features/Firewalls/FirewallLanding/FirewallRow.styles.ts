import { styled } from '@mui/material/styles';

export const StyledDivWrapper = styled('div', {
  label: 'StyledDivWrapper',
})(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
  marginTop: theme.spacing(1),
}));

export const StyledSpan = styled('span', {
  label: 'StyledSpan',
})(({ theme }) => ({
  display: 'inline-block',
  marginBottom: theme.spacing(0.5),
  marginRight: theme.spacing(0.5),
}));
