import { styled } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';
import Grid from '@mui/material/Unstable_Grid2';

export const StyledWrapperGrid = styled(Grid, { label: 'StyledWrapperGrid' })(
  ({ theme }) => ({
    '&.MuiGrid-item': {
      padding: 5,
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: `-${theme.spacing(1.5)}`,
    },
  })
);

export const StyledRootGrid = styled(Grid, { label: 'StyledRootGrid' })(
  ({ theme }) => ({
    backgroundColor: theme.color.white,
    margin: 0,
    width: '100%',
  })
);

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})({
  lineHeight: '1.5rem',
  marginBottom: 8,
  marginLeft: 15,
  marginTop: 8,
});
