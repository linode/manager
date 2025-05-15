import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  '&:before': {
    backgroundColor: theme.color.red,
    content: '""',
    height: 3,
    left: -30,
    position: 'absolute',
    top: 7,
    width: 16,
  },
  '&:last-of-type': {
    marginBottom: 0,
  },
  color: theme.color.headline,
  marginBottom: `calc(${theme.spacing(2)} - 3)`,
  position: 'relative',
  textAlign: 'left',
}));

export const StyledIconGrid = styled(Grid, { label: 'StyledIconGrid' })({
  '& svg': {
    display: 'flex',
    height: 56,
    width: 56,
  },
});

export const StyledRootGrid = styled(Grid, { label: 'StyledRootGrid' })(
  ({ theme }) => ({
    padding: `0`,
    textAlign: 'center',
    [theme.breakpoints.down('lg')]: {
      padding: `${theme.spacing(2)} 0 0`,
    },
  })
);
