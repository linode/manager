import { Box } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledTransferDisplayContainer = styled(Box, {
  label: 'StyledTransferDisplayTypography',
})(({ theme }) => ({
  margin: 'auto',
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    width: '85%',
  },
  width: '100%',
}));
