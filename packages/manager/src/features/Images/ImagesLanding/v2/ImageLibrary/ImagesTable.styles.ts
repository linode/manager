import { Paper, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledImageTable = styled(Paper, { label: 'StyledImageTable' })(
  ({ theme }) => ({
    marginBottom: theme.spacingFunction(24),
    padding: 0,
  })
);

export const StyledImageTableHeader = styled('div', {
  label: 'StyledImageTableHeader',
})(({ theme }) => ({
  border: `1px solid ${theme.tokens.alias.Border.Normal}`,
  borderBottom: 0,
  padding: theme.spacingFunction(8),
  paddingLeft: theme.spacingFunction(12),
}));

export const StyledImageTableSubheader = styled(Typography, {
  label: 'StyledImageTableSubheader',
})(({ theme }) => ({
  marginTop: theme.spacingFunction(8),
}));
