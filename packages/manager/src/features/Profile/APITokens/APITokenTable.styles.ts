import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import { Typography } from 'src/components/Typography';

export const StyledRootContainer = styled(Grid, {
  label: 'StyledRootContainer',
})(({ theme }) => ({
  background: theme.color.white,
  margin: 0,
  width: '100%',
}));

export const StyledHeadline = styled(Typography, {
  label: 'StyledHeadline',
})(() => ({
  marginLeft: 7,
}));

export const StyledAddNewWrapper = styled(Grid, {
  label: 'StyledAddNewWrapper',
})(() => ({
  '&.MuiGrid-item': {
    padding: 5,
  },
}));
