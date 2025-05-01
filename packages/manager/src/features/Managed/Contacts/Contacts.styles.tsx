import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';

export const StyledWrapperGrid = styled(Grid, { label: 'StyledWrapperGrid' })(
  ({ theme }) => ({
    '&.MuiGrid-item': {
      paddingRight: 0,
      paddingTop: 0,
    },
    paddingRight: 0,
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
  })
);

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  fontSize: '0.875rem',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('lg')]: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
}));

export const StyledHeaderGrid = styled(Grid, { label: 'StyledHeaderGrid' })({
  margin: 0,
  width: '100%',
});
