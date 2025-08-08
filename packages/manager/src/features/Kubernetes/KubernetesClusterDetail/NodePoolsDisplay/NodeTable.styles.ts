import { Box } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const NodePoolTableFooter = styled(Box, {
  label: 'NodePoolTableFooter',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  columnGap: theme.spacingFunction(32),
  rowGap: theme.spacingFunction(8),
  paddingTop: theme.spacingFunction(8),
  paddingButtom: theme.spacingFunction(8),
  [theme.breakpoints.down('md')]: {
    alignItems: 'unset',
    flexDirection: 'column',
  },
}));
