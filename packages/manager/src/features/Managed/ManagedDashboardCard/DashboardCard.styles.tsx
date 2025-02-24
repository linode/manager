import { Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';

export const StyledRootGrid = styled(Grid, { label: 'StyledRootGrid' })(
  ({ theme }) => ({
    backgroundColor: theme.bg.white,
    margin: `0 0 ${theme.spacing(2.5)} 0`,
    width: '100% !important',
  })
);

export const StyledHeaderGrid = styled(Grid, { label: 'StyledHeaderGrid' })(
  ({ theme }) => ({
    padding: theme.spacing(3),
    paddingBottom: 0,
  })
);

export const StyledTypography = styled(Typography, {
  label: 'StyledTypograohy',
})(({ theme }) => ({
  left: `-${theme.spacing(2)}`,
  marginLeft: theme.spacing(0.5),
  position: 'relative',
  top: 6,
}));
