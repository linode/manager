import { Paper, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
}));

export const StyledSmallGraphGrid = styled(Grid, {
  label: 'StyledSmallGraphGrid',
})(({ theme }) => ({
  boxSizing: 'border-box',
  margin: '0',
  marginTop: `calc(${theme.spacing(6)} + 3px)`,
  [theme.breakpoints.down('md')]: {
    marginTop: theme.spacing(3.25),
  },
}));

export const StyledRootPaper = styled(Paper, { label: 'StyledRootPaper' })(
  ({ theme }) => ({
    padding: `${theme.spacing(3.25)} ${theme.spacing(3.25)} ${theme.spacing(
      5.5
    )}`,
  })
);
