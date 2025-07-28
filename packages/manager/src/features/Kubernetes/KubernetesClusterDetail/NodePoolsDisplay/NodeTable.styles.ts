import { Box } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const NodePoolTableFooter = styled(Box, {
  label: 'NodePoolTableFooter',
})(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacingFunction(8),
  paddingTop: theme.spacingFunction(8),
  paddingButtom: theme.spacingFunction(8),
  justifyContent: 'space-between',
}));
