import { Box, Paper, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

export const StyledImageContainer = styled(Paper, {
  label: 'StyledImageContainer',
})(({ theme }) => ({
  border: `1px solid ${theme.tokens.alias.Border.Normal}`,
  marginBottom: theme.spacingFunction(24),
  padding: 0,
}));

export const StyledImageTableHeader = styled(Box, {
  label: 'StyledImageTableHeader',
})(({ theme }) => ({
  padding: `${theme.spacingFunction(16)} ${theme.spacingFunction(24)} 0`,
}));

export const StyledImageTableSubheader = styled(Typography, {
  label: 'StyledImageTableSubheader',
})(({ theme }) => ({
  marginTop: theme.spacingFunction(8),
}));

export const StyledImageTableContainer = styled(Box, {
  label: 'StyledImageTableContainer',
})(({ theme }) => ({
  padding: `${theme.spacingFunction(16)} ${theme.spacingFunction(24)} ${theme.spacingFunction(24)}`,
  '& .MuiTable-root': {
    border: 'none',
  },
  '& [data-qa-table-pagination]': {
    border: 'none',
  },
}));
