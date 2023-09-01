import { styled } from '@mui/material/styles';

import { Typography } from 'src/components/Typography';

export const StyledTransferDisplayTypography = styled(Typography, {
  label: 'StyledTransferDisplayTypography',
})(({ theme }) => ({
  margin: 'auto',
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    width: '85%',
  },
  width: '100%',
}));
